/*
 * This file is part of the Education Network Simulator project and covered 
 * by GPLv3 license. See full terms in the LICENSE file at the root folder
 * or at http://www.gnu.org/licenses/gpl-3.0.html.
 * 
 * (c) 2015 Jorge García Ochoa de Aspuru
 * bardok@gmail.com
 * 
 * Images are copyrighted by their respective authors and have been 
 * downloaded from http://pixabay.com/
 * 
 */

var TrafficManager = function(connectable, limitbroadcast, performNAT) 
{
    this.id = getNextID();
    var connectable = connectable;
    var apptable = [];
    var limitbroadcast = limitbroadcast;
    var performNAT = performNAT;
    var NATtable = [];
    var _self = this;
    var diagnosticsLog = [];
    var icmpResponses = [];
    
    this.save = function() 
    {
        var result = {};
        result.version = 1;
        result.id = this.id;
        result.limitbroadcast = limitbroadcast;
        result.performNAT = performNAT;
        result.NATtable = [];
        
        for (var port in NATtable) 
        {
            if (NATtable[port].fixed) 
            {
                result.NATtable.push(NATtable[port]);
            }
        }
        
        return result;
    };
    
    this.load = function(data) 
    {
        this.id = data.id;
        limitbroadcast = data.limitbroadcast;
        performNAT = data.performNAT;
        for (var i = 0; i < data.NATtable.length; i++) 
        {
            this.addNATEntry(data.NATtable[i].newport, data.NATtable[i].port, data.NATtable[i].ip, data.NATtable[i].originIface ? data.NATtable[i].originIface : ROUTER_WAN, data.NATtable[i].fixed);
        }
    };
    
    this.registerApplication = function(app, port, fixed) 
    {
        var data = {};
        data.app = app;
        data.port = port;
        data.fixed = fixed;
        
        apptable[port] = data;
    };
    
    this.sendMessage = function(connector, message) 
    {
        //- si es broadcast y no limitamos, se manda por todos, menos por el que ha venido.
        if (!limitbroadcast && (connectable.compatibleBroadcastMAC(message.getDestinationMAC()))) 
        {
            for (var i = 0; i < connectable.getConnectorNumber(); i++) 
            {
                var c = connectable.getConnector(i);
                if (c !== connector) 
                {
                    c.send(message);
                }
            }
        } 
        //- si no, pregunta el conector por el que lo tiene que mandar
        else 
        {
            //var c = network.findNextConnectorInPath(connectable, message.getDestinationIP(), message.getDestinationMAC());
            var c = connectable.getSenderConnectorForMAC(message.getDestinationMAC());
            if ((c !== connector) && (c !== null)) 
            {
                c.send(message);
            }
        //- si es el mismo, o no hay camino, lo descarta
        }
    }
    
    this.addNATEntry = function(newport, port, ip, originIface, fixed) 
    {
        NATtable[newport] = {};
        NATtable[newport].ip = ip;
        NATtable[newport].newport = newport;
        NATtable[newport].port = port;
        NATtable[newport].originIface = originIface;
        NATtable[newport].fixed = fixed;
    };
    
    this.getNATData = function() 
    {
        var result = [];
        for (port in NATtable) 
        {
            if (NATtable[port].fixed) 
            {
                var data = [];
                data[0] = NATtable[port].originIface;
                data[1] = NATtable[port].port;
                data[2] = NATtable[port].newport;
                data[3] = NATtable[port].ip;
                result.push(data);
            }
        }
        return result;
    };
    
    this.removeFixedNATData = function() 
    {
        for (port in NATtable) 
        {
            if (NATtable[port].fixed) 
            {
                this.deleteNATEntry(port);
            }
        }
    };
    
    this.deleteNATEntry = function(port) 
    {
        if (port in NATtable) 
        {
            delete NATtable[port];
        }
    };
    
    function proccessTCP(connector, message) 
    {
        // Si es para mi MAC o es broadcast MAC, es para mí
        // Si no es para mí, o es broadcast y no limito, hay que enviar
        // Si es para mí, y tengo app, lo mando
        // Si es para mí, y tengo routing, busco la nueva MAC y reenvío
        var forme = false;
        var mustsend = false;
        
        forme = connectable.compatibleMAC(message.getDestinationMAC(), true);
        
        mustsend = !forme || (connectable.compatibleBroadcastMAC(message.getDestinationMAC()) && !limitbroadcast);
        if (forme)
        {
            message.decreaseTTL();
            if (message.getDstPort() in apptable) 
            {
                apptable[message.getDstPort()].app.receiveMessage(message);
                if (!apptable[message.getDstPort()].fixed) 
                {
                    delete apptable[message.getDstPort()];
                }
            } 
            else if (performNAT && !connectable.compatibleBroadcastMAC(message.getDestinationMAC())) 
            {
                // Si existe el puerto destino en la tabla NAT y coincide con el conector
                if ((message.getDstPort() in NATtable) && (NATtable[message.getDstPort()].originIface == connectable.getConnectorPos(connector))) 
                {
                    var dstport = message.getDstPort();
                    message.setDestinationIP(NATtable[dstport].ip);
                    message.setDstPort(NATtable[dstport].port);
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    /*var mac = connectable.getMACforIP(message.getDestinationIP(), connector);
                    if ((mac === null) && connectable.getOwner().getType() === "router") 
                    {
                        mac = connectable.getDstMAC(ROUTER_WAN, message.getDestinationIP());
                    }*/
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    }
                    if (!NATtable[dstport].fixed) 
                    {
                        delete NATtable[dstport];
                    }
                } 
                // Si no existe
                else 
                {
                    var newport = getDinamycPort();
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    /*var mac = connectable.getMACforIP(message.getDestinationIP(), connector);
                    // A revisar: si mac es null, y es un router, lo intento enviar por el GW de WAN
                    if ((mac === null) && connectable.getOwner().getType() === "router") 
                    {
                        mac = connectable.getDstMAC(ROUTER_WAN, message.getDestinationIP());
                    }*/
                    
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            var pos = connectable.getConnectorPos(c);

                            // Si hay que enviar por otro conector, hago NAT
                            if (c !== connector) 
                            {
                                // Añadimos una entrada dinámica para recibir la respuesta (desde la interfaz de salida)
                                _self.addNATEntry(newport, message.getOrigPort(), message.getOriginIP(), pos, false);
                                
                                message.setOriginIP(connectable.getIPInfo(pos).getIPv4());
                                message.setOriginMAC(connectable.getMAC(pos));
                                message.setOrigPort(newport);
                            }
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    
                    }
                }
            } 
            else if (!connectable.compatibleBroadcastMAC(message.getDestinationMAC())) 
            {
                var mac = connectable.getDstMAC(message.getDestinationIP());
                if (mac !== null) 
                {
                    var c = connectable.getSenderConnectorForMAC(mac);
                    if (c !== null) 
                    {
                        message.setDestinationMAC(mac);
                        c.send(message);
                    }
                }
            }
        }
        
        if (mustsend) 
        {
            _self.sendMessage(connector, message);
        }
    }
    
    function proccessICMP(connector, message) 
    {
        var forme = connectable.compatibleMAC(message.getDestinationMAC(), false);
        var myip = (connector.getIPInfo() !== null) && (message.getDestinationIP() === connector.getIPInfo().getIPv4());
        if (forme)
        {
            message.decreaseTTL();            
        }
        switch (message.getData().command) 
        {
            case "ping":
                // Si es para mí, genero el ping response
                if (forme && myip) 
                {
                    var dst = message.getOriginIP();
                    var ifacepos = connectable.getConnectorPos(connector);
                    var origmsgid = message.getId();
                    _self.pingResponse(dst, ifacepos, origmsgid);
                } 
                // Si es para mí, pero no es mi IP, y hago NAT, cambio el origen y añado el id y la ip de origen a la tabla de espera
                else if (forme && !myip && performNAT) 
                {
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    /*var mac = connectable.getMACforIP(message.getDestinationIP(), connector);
                    if ((mac === null) && connectable.getOwner().getType() === "router") 
                    {
                        mac = connectable.getDstMAC(ROUTER_WAN, message.getDestinationIP());
                    }*/
                    
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            // Si el conector de destino y el de origen son diferentes, hago NAT
                            if (c !== connector) 
                            {
                                var pos = connectable.getConnectorPos(c);
                                var data = {};
                                data.ip = message.getOriginIP();
                                data.mac = message.getOriginMAC();
                                icmpResponses[message.getId()] = data;
                                
                                message.setOriginIP(connectable.getIPInfo(pos).getIPv4());
                                message.setOriginMAC(connectable.getMAC(pos));
                            }
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    
                    }
                } 
                // Si es para mí, pero no es mi IP, y no hago NAT, busco la siguiente mac y envío
                else if (forme && !myip && !performNAT) 
                {
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    
                    }
                } 
                // Si no es para mí intento enviar por la siguiente interfaz
                else if (!forme) 
                {
                    _self.sendMessage(connector, message);
                }
                break;
            case "traceroute":
                // Si es para mí, genero el traceroute response (+1 seq)
                if (forme && myip) 
                {
                    var dst = message.getOriginIP();
                    var ifacepos = connectable.getConnectorPos(connector);
                    var origmsgid = message.getId();
                    _self.tracerouteResponse(dst, ifacepos, origmsgid, true, message.getData().seq + 1, message.getDestinationIP());
                } 
                // Si es para mí, pero no es mi IP, cambio el origen y añado el id y la ip de origen a la tabla de espera y genero un traceroute response (+1 seq)
                else if (forme && !myip && performNAT) 
                {
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    /*var mac = connectable.getMACforIP(message.getDestinationIP(), connector);
                    if ((mac === null) && connectable.getOwner().getType() === "router") 
                    {
                        mac = connectable.getDstMAC(ROUTER_WAN, message.getDestinationIP());
                    }*/
                    
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            var dst = message.getOriginIP();
                            var ifacepos = connectable.getConnectorPos(connector);
                            var origmsgid = message.getId();
                            var seq = message.getData().seq + 1;
                            _self.tracerouteResponse(dst, ifacepos, origmsgid, false, seq, message.getDestinationIP());

                            // Si el conector de destino y el de origen son diferentes, hago NAT
                            if (c !== connector) 
                            {
                                var pos = connectable.getConnectorPos(c);
                                var data = {};
                                data.ip = message.getOriginIP();
                                data.mac = message.getOriginMAC();
                                icmpResponses[message.getId()] = data;
                                
                                message.setOriginIP(connectable.getIPInfo(pos).getIPv4());
                                message.setOriginMAC(connectable.getMAC(pos));
                            }
                            message.getData().seq = seq;
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    
                    }
                } 
                // Si es para mí, pero no es mi IP, y no hago NAT, busco la siguiente mac y envío, y respondo
                else if (forme && !myip && !performNAT) 
                {
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            var dst = message.getOriginIP();
                            var ifacepos = connectable.getConnectorPos(connector);
                            var origmsgid = message.getId();
                            var seq = message.getData().seq + 1;
                            _self.tracerouteResponse(dst, ifacepos, origmsgid, false, seq, message.getDestinationIP());
                            
                            var pos = connectable.getConnectorPos(c);
                            message.getData().seq = seq;
                            message.setOriginMAC(connectable.getMAC(pos));
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    
                    }
                } 
                // Si no es para mí intento enviar por la siguiente interfaz
                else if (!forme) 
                {
                    _self.sendMessage(connector, message);
                }
                break;
            case "pingresponse":
                // Si es para mí, y es una respuesta a un id en la tabla, reenvío y borro de la tabla
                if (forme && (message.getData().originMessageId in icmpResponses)) 
                {
                    message.setDestinationIP(icmpResponses[message.getData().originMessageId].ip);
                    message.setDestinationMAC(icmpResponses[message.getData().originMessageId].mac);
                    _self.sendMessage(connector, message);
                    delete icmpResponses[message.getData().originMessageId];
                } 
                // Si es para mí, y es mi IP, y no es una respuesta a un id en la tabla, hago log
                else if (forme && myip && !(message.getData().originMessageId in icmpResponses)) 
                {
                    addDiagnosticInfo(_("Ping response recieved from ") + message.getOriginIP());
                } 
                // Si es para mí, y no es mi IP, y no es una respuesta a un id en la tabla, busco MAC y envio
                else if (forme && !myip && !(message.getData().originMessageId in icmpResponses)) 
                {
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    }
                } 
                // Si no intento enviar por la siguiente interfaz
                else if (!forme) 
                {
                    _self.sendMessage(connector, message);
                }
                break;
            case "tracerouteresponse":
                // Si es para mí, y es una respuesta a un id en la tabla, reenvío y si es el final, borro de la tabla
                if (forme && (message.getData().originMessageId in icmpResponses)) 
                {
                    message.setDestinationIP(icmpResponses[message.getData().originMessageId].ip);
                    message.setDestinationMAC(icmpResponses[message.getData().originMessageId].mac);
                    _self.sendMessage(connector, message);
                    if (message.getData().final) 
                    {
                        delete icmpResponses[message.getData().originMessageId];
                    }
                } 
                // Si es para mí, y es mi IP, y no es una respuesta a un id en la tabla, hago log
                else if (forme && myip && !(message.getData().originMessageId in icmpResponses)) 
                {
                    addDiagnosticInfo(message.getData().seq + _(" - Traceroute to ") + message.getData().dstIp + ": " + message.getOriginIP());
                } 
                // Si es para mí, y no es mi IP, y no es una respuesta a un id en la tabla, busco MAC y envio
                else if (forme && !myip && !(message.getData().originMessageId in icmpResponses)) 
                {
                    var mac = connectable.getDstMAC(message.getDestinationIP());
                    if (mac !== null) 
                    {
                        var c = connectable.getSenderConnectorForMAC(mac);
                        if (c !== null) 
                        {
                            message.setDestinationMAC(mac);
                            c.send(message);
                        }
                    }
                } 
                // Si no es para mí, intento enviar por la siguiente interfaz
                else if (!forme) 
                {
                    _self.sendMessage(connector, message);
                }
                break;
        }
    }
    
    this.proccess = function(connector, message) 
    {
        connectable.updateAddressing(message.getOriginMAC(), connectable.getConnectorPos(connector));
        switch (message.getType()) 
        {
            case "tcp":
                proccessTCP(connector, message);
                break;
            case "icmp":
                proccessICMP(connector, message);
                break;
        }
    };
    
    this.getFixedNATtable = function() 
    {
        var result = [];
        
        for (var port in NATtable) 
        {
            if (NATtable[port].fixed) 
            {
                result[port] = {};
                result[port].port = NATtable[port].port;
                result[port].ip = NATtable[port].ip;
            }
        }
        
        return result;
    };
    
    this.getDiagnosticsInfo = function() 
    {
        var result = "";
        
        //for (var i = (diagnosticsLog.length > 15 ? diagnosticsLog.length - 16 : 0); i < diagnosticsLog.length; i++)
        for (var i = diagnosticsLog.length-1; i >= 0; i--) 
        {
            result += (diagnosticsLog[i] + ((i === diagnosticsLog.length) ? "" : "<br/>"));
        }
        
        return result;
    };
    
    function addDiagnosticInfo(msg) 
    {
        diagnosticsLog.push(msg);
        var div = document.getElementById("diagnosticsconsole");
        if (div !== null) 
        {
            div.innerHTML = _self.getDiagnosticsInfo();
        }
    }
    
    this.ping = function(dst, ifacepos) 
    {
        // Si no es una IP
        var dstip = null;
        if (!isValidIPv4(dst)) 
        {
            dstip = connectable.getOwner().getApp("DNSClient").getIp(dst);
        } 
        else 
        {
            dstip = dst;
        }
        if (dstip === null) 
        {
            addDiagnosticInfo("Unknown domain: " + dst);
        } 
        else 
        {
            // Crear un mensaje de tipo ICMP
            var MAC = connectable.getDstMAC(dstip);
            if (MAC !== null) 
            {
                var data = {};
                data.command = "ping";
                data.description = "PING: " + dstip;
                var message = new Message(
                "icmp", 
                connectable.getIPInfo(ifacepos).getIPv4(), 
                dstip, 
                connectable.getMAC(ifacepos), 
                MAC, 
                -1, 
                -1, 
                data, 
                images[IMAGE_ENVELOPEICMP]
                );
                addDiagnosticInfo(_("Sending ping to: ") + message.getDestinationIP());
                connectable.getConnector(ifacepos).send(message);
            }
        }
    };
    
    this.traceroute = function(dst, ifacepos) 
    {
        // Si no es una IP
        var dstip = null;
        if (!isValidIPv4(dst)) 
        {
            dstip = connectable.getOwner().getApp("DNSClient").getIp(dst);
        } 
        else 
        {
            dstip = dst;
        }
        if (dstip === null) 
        {
            addDiagnosticInfo("Unknown domain: " + dst);
        } 
        else 
        {
            // Crear un mensaje de tipo ICMP
            var MAC = connectable.getDstMAC(dstip);
            if (MAC !== null) 
            {
                var data = {};
                data.command = "traceroute";
                data.description = "Traceroute: " + dstip;
                data.seq = 0;
                var message = new Message(
                "icmp", 
                connectable.getIPInfo(ifacepos).getIPv4(), 
                dstip, 
                connectable.getMAC(ifacepos), 
                MAC, 
                -1, 
                -1, 
                data, 
                images[IMAGE_ENVELOPEICMP]
                );
                addDiagnosticInfo(_("Sending traceroute to: ") + message.getDestinationIP());
                connectable.getConnector(ifacepos).send(message);
            }
        }
    };
    
    this.pingResponse = function(dst, ifacepos, origmsgid) 
    {
        // Si no es una IP
        var dstip = null;
        if (!isValidIPv4(dst)) 
        {
            dstip = connectable.getOwner().getApp("DNSClient").getIp(dst);
        } 
        else 
        {
            dstip = dst;
        }
        if (dstip === null) 
        {
            addDiagnosticInfo("Unknown domain: " + dst);
        } 
        else 
        {
            // Crear un mensaje de tipo ICMP
            var MAC = connectable.getDstMAC(dstip);
            if (MAC !== null) 
            {
                var data = {};
                data.command = "pingresponse";
                data.description = "PING Response";
                data.originMessageId = origmsgid;
                var message = new Message(
                "icmp", 
                connectable.getIPInfo(ifacepos).getIPv4(), 
                dstip, 
                connectable.getMAC(ifacepos), 
                MAC, 
                -1, 
                -1, 
                data, 
                images[IMAGE_ENVELOPEICMP]
                );
                connectable.getConnector(ifacepos).send(message);
            }
        }
    };
    
    this.tracerouteResponse = function(dst, ifacepos, origmsgid, final, seq, originMessageIP) 
    {
        // Si no es una IP
        var dstip = null;
        if (!isValidIPv4(dst)) 
        {
            dstip = connectable.getOwner().getApp("DNSClient").getIp(dst);
        } 
        else 
        {
            dstip = dst;
        }
        if (dstip === null) 
        {
            addDiagnosticInfo("Unknown domain: " + dst);
        } 
        else 
        {
            // Crear un mensaje de tipo ICMP
            var MAC = connectable.getDstMAC(dstip);
            if (MAC !== null) 
            {
                var data = {};
                data.command = "tracerouteresponse";
                data.originMessageId = origmsgid;
                data.final = final;
                data.seq = seq;
                data.dstIp = originMessageIP;
                data.description = "Traceroute Response";
                var message = new Message(
                "icmp", 
                connectable.getIPInfo(ifacepos).getIPv4(), 
                dstip, 
                connectable.getMAC(ifacepos), 
                MAC, 
                -1, 
                -1, 
                data, 
                images[IMAGE_ENVELOPEICMP]
                );
                connectable.getConnector(ifacepos).send(message);
            }
        }
    };
    
    this.setPerformNAT = function(pnat) 
    {
        performNAT = pnat;
    };

};
