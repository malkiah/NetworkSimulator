function newElement(type) 
{
    switch (type) 
    {
        case "host":
            network.createComputer(0, 50);
            break;
        case "dns":
            network.createDNSServer(0, 50);
            break;
        case "dhcp":
            network.createDHCPServer(0, 50);
            break;
        case "web":
            network.createHTTPServer(0, 50);
            break;
        case "switch":
            network.createSwitch(0, 50, 8);
            break;
        case "router":
            network.createRouter(0, 50);
            break;
    }
}

function simulator(imgs) 
{
    images = imgs;
    var container = document.getElementById("simcontainer");
    var canvas = document.getElementById("simcanvas");
    
    var W = container.offsetWidth * window.devicePixelRatio;
    var H = container.offsetHeight * window.devicePixelRatio;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d", {antialias: true});
    
    uimanager = new UIManager();

    network = new Network(images, ctx, W, H);
    network.init();
    
    if (NetworkSimulator.initialdata !== null)
    {
      network.load(NetworkSimulator.initialdata);
    }
}

