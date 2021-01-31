const msRest = require("@azure/ms-rest-nodeauth");
const armBatch = require("@azure/arm-batch");
const { getBatchAccountNames, getResourceGroups, getApplications, getApplicationVersions, getImages, getPools} = require('./autocomplete');
const parsers = require("./parsers");

/**
 * Internal function for handling authentication and generation of batch managmnet client
 * @param {*} settings
 * @returns BatchManagementClient
 */
async function _getBatchClient(settings) {
    /**
     * Create credentials from the clientId, secret and domain
     */
    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);

    /**
     * Create new compute mamagement client using the credentials and subscription ID
     * And returns the new compute mamagement client
     */
    const client = new armBatch.BatchManagementClient(credentials, settings.subscriptionId);
    return client;
}

async function createPool(action, settings) {
    const batchClinet = await _getBatchClient(settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const accountName = parsers.autocomplete(action.params.batchAccountName);
    const poolName = action.params.poolName;
    const application = parsers.autocomplete(action.params.application);
    const applicationVersion = parsers.autocomplete(action.params.applicationVersion);

    const scaleSettings = {
        fixedScale: {
            targetDedicatedNodes: parseInt(action.params.targetDedicatedNodes),
            targetLowPriorityNodes: parseInt(action.params.targetLowPriorityNodes),
        },
    };

    let image;

    if (!action.params.image){
        throw "Image must be specified";
    }

    // If autocomplete
    if (action.params.image.id){
        try{
            image = JSON.parse(action.params.image.id);
        } catch (err){
            throw "Invalid image ID supploed"
        }
    } else {
        image = action.params.image;
    }

    const deploymentConfiguration = { 
        virtualMachineConfiguration: {
            imageReference: image.imageReference,
            nodeAgentSkuId: image.nodeAgentSKUId,
        }
    };

    var pool = {
        id: action.params.poolName,
        displayName: action.params.poolName,
        vmSize: action.params.vmSize,
        scaleSettings: scaleSettings,
        deploymentConfiguration: deploymentConfiguration,
        applicationPackages: [{
            id : `/subscriptions/${settings.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Batch/batchAccounts/${accountName}/applications/${application}`,
            version: applicationVersion
        }]
    };

    if (action.params.startTaskCommandLine) {
        let startTask = {
            commandLine: action.params.startTaskCommandLine,
            userIdentity: {
                userName: action.params.startTaskUsername,
            },
            environmentSettings: action.params.startTaskEnvironmentSettings || [],
            // [
            //     {
            //         name : "",
            //         value : ""
            //     }
            // ]
        };
        pool.startTask = startTask;
    }

    return batchClinet.pool.create(resourceGroupName, accountName, poolName, pool);
}

async function deletePool(action, settings) {
    const resourceGroupName = action.params.resourceGroupName;
    const accountName = action.params.accountName;
    const poolName = action.params.poolName;
    
    const batchClinet = await _getBatchClient(settings);
    return batchClinet.pool.deleteMethod(resourceGroupName, accountName, poolName);
}

async function deployPackageToPool(action, settings) {
    const batchClinet = await _getBatchClient(settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const accountName = parsers.autocomplete(action.params.batchAccountName);
    const application = parsers.autocomplete(action.params.application);
    const applicationVersion = parsers.autocomplete(action.params.applicationVersion);
    const poolName = action.params.poolName;

    var pool = {
        applicationPackages: [{
            id : `/subscriptions/${settings.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Batch/batchAccounts/${accountName}/applications/${application}`,
            version: applicationVersion
        }],
    };

    return batchClinet.pool.update(resourceGroupName, accountName, poolName, pool);
}

async function clonePool(action, settings) {
    const batchClinet = await _getBatchClient(settings);
    const resourceGroupName = parsers.autocomplete(action.params.resourceGroupName);
    const accountName = parsers.autocomplete(action.params.batchAccountName);
    const basePoolName = parsers.autocomplete(action.params.basePoolName);
    const application = parsers.autocomplete(action.params.application);
    const applicationVersion = parsers.autocomplete(action.params.applicationVersion);
    const poolName = action.params.newPoolName;
    
    const pool = await batchClinet.pool.get(resourceGroupName,accountName,basePoolName);
    const poolVirtualMachineConfiguration = pool.deploymentConfiguration.virtualMachineConfiguration;
    
    let startTask;
    if (action.params.startTaskCommandLine) {
        const isStartTaskExist = !!pool.startTask
        const environmentSettings = action.params.startTaskEnvironmentSettings || (isStartTaskExist? pool.startTask.environmentSettings : []);
        
        startTask = {
            commandLine: action.params.startTaskCommandLine,
            userIdentity: isStartTaskExist? pool.startTask.userIdentity : undefined,
            environmentSettings: environmentSettings
        };
    };

    let image;
    // If autocomplete
    if(action.params.image){
        if (action.params.image.id){
            try{
                image = JSON.parse(action.params.image.id);
            } catch (err){
                throw "Invalid image ID supploed"
            }
        } else {
            image = action.params.image;
        }
    }
        
    var pool = {
        id: action.params.poolName,
        displayName: action.params.poolName,
        vmSize: action.params.vmSize || pool.vmSize,
        scaleSettings: {
            fixedScale: {
                targetDedicatedNodes: parseInt(action.params.targetDedicatedNodes) || pool.scaleSettings.fixedScale.targetDedicatedNodes,
                targetLowPriorityNodes: parseInt(action.params.targetLowPriorityNodes) || pool.scaleSettings.fixedScale.targetLowPriorityNodes,
            },
        },
        deploymentConfiguration: { 
            virtualMachineConfiguration: image ? {
                imageReference: image.imageReference,
                nodeAgentSkuId: image.nodeAgentSKUId,
            } : poolVirtualMachineConfiguration
        },
        applicationPackages: [{
            id : `/subscriptions/${settings.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Batch/batchAccounts/${accountName}/applications/${application}` || pool.applicationPackages[0].id,
            version: applicationVersion || pool.applicationPackages[0].version
        }],
        startTask: startTask || pool.startTask
    };

    return batchClinet.pool.create(resourceGroupName, accountName, poolName, pool);
}

module.exports = {
    createPool,
    deletePool,
    deployPackageToPool,
    clonePool,
    // Autocomplete
    getBatchAccountNames,
    getResourceGroups,
    getApplications,
    getApplicationVersions,
    getImages,
    getPools
};
