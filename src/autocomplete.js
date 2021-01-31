const msRest = require("@azure/ms-rest-nodeauth");
const armBatch = require("@azure/arm-batch");
const armResources = require("@azure/arm-resources");
const azureBatch = require("@azure/batch");
const parsers = require('./parsers');

function paramsMapper(pluginSettings,actionParams){
    const settings = {};
    const params = {};

    if (pluginSettings && pluginSettings.length > 0) {
        pluginSettings.forEach(setting=>{
            settings[setting.name] = setting.value;
        })
    }

    if (actionParams && actionParams.length > 0) {
        actionParams.forEach(param=>{
            params[param.name] = param.value;
        })
    }

    return {settings, params};
}

async function getBatchAccountUrl(credentials, resourceGroupName,accountName, subscriptionId){
    const client = new armBatch.BatchManagementClient(credentials, subscriptionId);
    const account = await client.batchAccount.get(resourceGroupName,accountName);
    return `https://${account.accountEndpoint}`;
}

async function getBatchAccountPrimaryKey(credentials, resourceGroupName, batchAccountName, subscriptionId){
    const client = new armBatch.BatchManagementClient(credentials, subscriptionId);
    const result = await client.batchAccount.getKeys(resourceGroupName,batchAccountName);
    return result.primary;
}

async function getResourceGroups(query, pluginSettings, actionParams){
    const {settings} = paramsMapper(pluginSettings,actionParams);

    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armResources.ResourceManagementClient(credentials, settings.subscriptionId);
    const groups = await client.resourceGroups.list();
    
    return groups
    // Filter only groups matching query    
    .filter(group=> group.name.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(group=>{
        return { id: group.name, value: group.name };
    });
}

async function getBatchAccountNames(query, pluginSettings, actionParams){
    const {settings} = paramsMapper(pluginSettings,actionParams);

    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armBatch.BatchManagementClient(credentials, settings.subscriptionId);
    
    const accounts = await client.batchAccount.list();
    
    return accounts
    // Filter only accounts matching query    
    .filter(account=> !query ? true : account.name.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(account=>{
        return { id: account.name, value: account.name };
    });
}

async function getApplications(query, pluginSettings, actionParams){
    const {settings, params} = paramsMapper(pluginSettings,actionParams);
    const resourceGroupName = parsers.autocomplete(params.resourceGroupName);
    const accountName = parsers.autocomplete(params.batchAccountName);

    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armBatch.BatchManagementClient(credentials, settings.subscriptionId);
    const applications = await client.application.list(resourceGroupName, accountName);
    
    return applications
    // Filter only accounts matching query    
    .filter(app=> !query ? true : app.id.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(app=>{
        return { id: app.id, value: app.id };
    });
}

async function getApplicationVersions(query, pluginSettings, actionParams){
    const {settings, params} = paramsMapper(pluginSettings,actionParams);

    const resourceGroupName = parsers.autocomplete(params.resourceGroupName);
    const accountName = parsers.autocomplete(params.batchAccountName);
    const applicationId = parsers.autocomplete(params.application);
    
    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);

    const client = new armBatch.BatchManagementClient(credentials, settings.subscriptionId);
    const applications = await client.application.list(resourceGroupName, accountName);
    
    const application = applications.find(app=>app.id==applicationId);
    if (!application) {
        throw `Could not find application ${applicationId}`;
    }

    if (!application.packages || !application.packages.length){
        throw `${applicationId} has no deployed versions`;
    }

    return application.packages// Filter only accounts matching query    
    .filter(package=> !query ? true : package.version.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(package=>{
        return { id: package.version, value: package.version };
    });
}

async function getImages(query, pluginSettings, actionParams){
    const {settings, params} = paramsMapper(pluginSettings,actionParams);
    const resourceGroupName = parsers.autocomplete(params.resourceGroupName);
    const accountName = parsers.autocomplete(params.batchAccountName);
    
    const getUrlCredentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const batchUrl = await getBatchAccountUrl(getUrlCredentials,resourceGroupName, accountName, settings.subscriptionId);
    const accountKey = await getBatchAccountPrimaryKey(getUrlCredentials, resourceGroupName,accountName, settings.subscriptionId);

    const credentials = new azureBatch.BatchSharedKeyCredentials(accountName,accountKey);
    const client = new azureBatch.BatchServiceClient(credentials, batchUrl);
    
    const images = await client.account.listSupportedImages();

    return images
    // Filter only accounts matching query    
    .filter(image=>{ 
        image.label = `${image.imageReference.offer}-${image.imageReference.sku}`;
        return !query ? true : image.label.toLowerCase().includes(query.toLowerCase())
    })
    // Take only first 5
    .slice(0,5)
    // Map to autocomplete format
    .map(image=>{
        return { value: image.label, id: JSON.stringify(image)};
    });
}

async function getPools(query, pluginSettings, actionParams){
    const {settings, params} = paramsMapper(pluginSettings,actionParams);
    const resourceGroupName = parsers.autocomplete(params.resourceGroupName);
    const accountName = parsers.autocomplete(params.batchAccountName);
    
    const credentials = await msRest.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain);
    const client = new armBatch.BatchManagementClient(credentials, settings.subscriptionId);

    const pools = await client.pool.listByBatchAccount(resourceGroupName, accountName);
    
    return pools
    // Filter only accounts matching query    
    .filter(pool=> !query ? true : pool.name.toLowerCase().includes(query.toLowerCase()))
    // Map to autocomplete format
    .map(pool=>{
        return { id: pool.name, value: pool.name };
    });
}


module.exports = {
    getBatchAccountNames,
    getResourceGroups,
    getApplications,
    getApplicationVersions,
    getImages,
    getPools
}; 