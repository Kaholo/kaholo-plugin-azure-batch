const msRest = require('@azure/ms-rest-nodeauth');
import { BatchManagementClient } from "@azure/arm-batch";

/**
 * Internal function for handling authentication and generation of batch managmnet client
 * @param {*} action 
 * @param {*} settings 
 * @returns BatchManagementClient
 */
function _getBatchClient(action, settings) {
	/**
	 * Create credentials from the clientId, secret and domain
	 */
    return msRest.loginWithServicePrincipalSecret(
        settings.clientId, settings.secret, settings.domain).then(credentials => {
			/**
			 * Create new compute mamagement client using the credentials and subscription ID
			 * And returns the new compute mamagement client
			 */
            const client = new BatchManagementClient(credentials, settings.subscriptionId);
            return client;
        });
}

function createPool(action, settings) {
    return _getBatchClient(action, settings).then(batchClinet => {
        let scaleSettings = {
            fixedScale : {
                targetDedicatedNodes : 0,
                targetLowPriorityNodes : 0
            }
        }

        let deploymentConfiguration = {
            virtualMachineConfiguration : {
                imageReference : {publisher:"Canonical",offer:"UbuntuServer",sku:"14.04.2-LTS",version:"latest"},
                nodeAgentSKUId : ""
            }
        }

        let startTask = {
            commandLine : "",
            userIdentity : {
                userName : ""
            },
            environmentSettings : [
                {
                    name : "",
                    value : ""
                }
            ]
        }

        let applicationPackages = [
            {
                id : "id",
                version : ""
            }
        ]
        
        var pool = { 
            id: poolid, 
            displayName: poolid, 
            vmSize: "vmSize",
            scaleSettings : scaleSettings,
            startTask : startTask,
            deploymentConfiguration : deploymentConfiguration,
            applicationPackages : applicationPackages
        };

        return batchClinet.pool.create("", "", "", pool)
    })
}

