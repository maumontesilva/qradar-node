/**
 * Created by maurosil on 24/03/2016.
 */

var async = require('async');
var RestfulService = require('../restful/restful.service');

var xfeEndpoints = {
  local_destination_addresses: '/api/siem/local_destination_addresses',
  offense_closing_reasons: '/api/siem/offense_closing_reasons',
  offenses: '/api/siem/offenses',
  source_addresses: '/api/siem/source_addresses'
};

module.exports = function(RED) {
    function readQRadar(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var sec;
        var username;
        var password;
        var headers = {};
        headers["Accept"] = 'application/json';
        headers["Version"] = '5.0';

        //Setting the node status as ready
        node.status({fill:"blue",shape:"dot",text:"ready"});
        if (config && config.token) {
            headers["SEC"] = config.token;
        }

        var restfulService = new RestfulService('https', config.server, config.port, username, password);

        //Registering a listener on the input event to receive messages from the up-stream nodes in a flow.
        this.on('input', function(msg) {
            //Setting the node status as running
            node.status({fill:"green",shape:"dot",text:"running"});

            var requestResult = [];
            console.log('MAURO OPTIONS: ', config.options);
            console.log('MAURO MSG.PAYLOAD: ', JSON.stringify(msg.payload) );
            var data = msg.payload[config.options]; //It should contains qradar parameters
            console.log('MAURO DATA: ', data);
            if(data && data.length && data.length > 0) {
                async.each(data, function(item, cb) {
                    restfulService.sendRequest('GET', xfeEndpoints[config.options] + '/' + item, null, headers,
                                            function(error, result) {
                        if(error) {
                            cb(err);
                        } else {
                            requestResult.push(result);
                            cb();
                        }
                    });
                }, function(err, resp) {
                    if(err) {
                        //Setting the node status as failed
                        node.status({fill:"red",shape:"dot",text:"failed"});

                        //console.log('RESTFUL ERROR: ', error);
                    }

                    sendNodeResponse(node, requestResult);
                });
            } else {
                restfulService.sendRequest('GET', xfeEndpoints[config.options], null,
                                                            headers, function(error, result) {
                        if(error) {
                            //Setting the node status as failed
                            node.status({fill:"red",shape:"dot",text:"failed"});
                        } else {
                            //console.log('MAURO OK: ', result);
                            sendNodeResponse(node, result);
                        }
                });
            }
        });
    }

    RED.nodes.registerType("QRadar", readQRadar, {
	      credentials: {
		    }
      });
}

function sendNodeResponse(node, result) {
    var msg = {};

    //console.log('RESTFUL OK: ', result);
    msg.payload = result;
    //Setting the node status as ready
    node.status({fill:"blue",shape:"dot",text:"ready"});

    //Sending a message to the down-stream nodes in a flow
    node.send(msg);
}