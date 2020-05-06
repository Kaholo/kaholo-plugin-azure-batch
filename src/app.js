const msRest = require('@azure/ms-rest-nodeauth');
const armBatch = require('@azure/arm-batch');

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
            const client = new armBatch.BatchManagementClient(credentials, settings.subscriptionId);
            return client;
        });
}

function createPool(action, settings) {
    return _getBatchClient(action, settings).then(batchClinet => {
        let scaleSettings = {
            fixedScale : {
                targetDedicatedNodes : parseInt(action.params.targetDedicatedNodes),
                targetLowPriorityNodes : parseInt(action.params.targetLowPriorityNodes)
            }
        }

        let deploymentConfiguration = {
            virtualMachineConfiguration : {
                imageReference : {
                    publisher:action.params.imageReferencePublisher,
                    offer:action.params.imageReferenceOffer,
                    sku:action.params.imageReferenceSku,
                    version:action.params.imageReferenceVersion
                },
                nodeAgentSkuId : action.params.nodeAgentSKUId
            }
        }

        let startTask = {
            commandLine : action.params.startTaskCommandLine,
            userIdentity : {
                userName : action.params.startTaskUsername
            },
            environmentSettings : action.params.startTaskEnvironmentSettings
            // [
            //     {
            //         name : "",
            //         value : ""
            //     }
            // ]
        }

        
        var pool = { 
            id: action.params.poolId, 
            displayName: action.params.poolId, 
            vmSize: action.params.vmSize,
            scaleSettings : scaleSettings,
            startTask : startTask,
            deploymentConfiguration : deploymentConfiguration,
            applicationPackages : action.params.applicationPackages
            // [
            //     {
            //         id : "id",
            //         version : ""
            //     }
            // ]
        };

        return batchClinet.pool.create(action.params.resourceGroupName, action.params.accountName, action.params.poolName, pool)
    })
}

module.exports = {
    createPool: createPool
}