# kaholo-plugin-azure-batch
Azure Batch plugin for Kaholo

**Settings:**

1. Client or App ID
2. Secret or Password
3. Domain or Tenant ID
4. Subscription ID

## Method: createPool

**Description**

This method will create a pool of compute nodes [For more info]. https://docs.microsoft.com/enus/rest/api/batchmanagement/pool/create). 
Pool nodes are the VMs that execute your tasks. Specify properties such as the number and size of the nodes, a Windows or Linux VM image, and an application to install when the nodes join the pool.

**Parameters**

1. Resource Group Name: The name of the resource group that contains the Batch account.
2. Account Name: The name of the Batch account.
3. Pool Name: The pool name. This must be unique within the account.
4. Pool ID: (display name), The display name for the pool.
5. VM Size: (String), The size of virtual machines in the pool.
6. Dedicated Nodes: (Integer), The desired number of dedicated compute nodes in the pool.
At least one of targetDedicatedNodes, targetLowPriority nodes must be set.
7. Low Priority Nodes: (Integer), The desired number of low-priority compute nodes in the pool.
At least one of targetDedicatedNodes, targetLowPriority nodes must be set.

A reference to an Azure Virtual Machines Marketplace image or the Azure Image resource of a custom Virtual Machine. To get the list of all imageReferences verified by Azure Batch, see the 'List supported node agent SKUs' operation.

8. Image publisher: (String) The publisher of the Azure Virtual Machines Marketplace image. For example, Canonical or MicrosoftWindowsServer.
9. Image offer: (String) The offer type of the Azure Virtual Machines Marketplace image.For example, UbuntuServer or WindowsServer.
10. Image sku: (String) The SKU of the Azure Virtual Machines Marketplace image. For example, 18.04-LTS or 2019-Datacenter.
11. Image version: (String) The version of the Azure Virtual Machines Marketplace image.
A value of 'latest' can be specified to select the latest version of an image. If omitted, the default is 'latest'.
12. Node sku ID: (String) The SKU of the Batch node agent to be provisioned on compute nodes in the pool.

A task which is run when a compute node joins a pool in the Azure Batch service, or when the compute node is rebooted or reimaged.

13. Start task commandLine: (String) A task specified to run on each compute node as it joins the pool.

14. Start task username: The user identity under which the start task runs.

15. Start task env settings: (Array) A list of environment variable settings for the start task.

16. Application Packages: (Array) The list of application packages to be installed on each compute node in the pool.

