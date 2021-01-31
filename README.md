# kaholo-plugin-azure-batch
Azure Batch plugin for Kaholo

**Settings:**

1. Client or App ID
2. Secret or Password
3. Domain or Tenant ID
4. Subscription ID

## Method: Create Pool

**Description**

This method will create a pool of compute nodes [For more info](https://docs.microsoft.com/en-us/rest/api/batchmanagement/pool/create).

Pool nodes are the VMs that execute your tasks. Specify properties such as the number and size of the nodes, a Windows or Linux VM image, and an application to install when the nodes join the pool.

**Parameters**

1. Resource Group: The resource group that contains the Batch account.
2. Batch Account: The Batch account to create the pool in.
3. Pool Name: The new of the new pool name. This must be unique within the account.
4. VM Size: (String), The size of virtual machines in the pool.
5. Dedicated Nodes: (Integer), The desired number of dedicated compute nodes in the pool.
At least one of targetDedicatedNodes, targetLowPriority nodes must be set.
6. Low Priority Nodes: (Integer), The desired number of low-priority compute nodes in the pool.
At least one of targetDedicatedNodes, targetLowPriority nodes must be set.

A reference to an Azure Virtual Machines Marketplace image or the Azure Image resource of a custom Virtual Machine. To get the list of all imageReferences verified by Azure Batch, see the 'List supported node agent SKUs' operation.

7. Image: The image to use for the new pool.

8. Start task commandLine: (String) A task specified to run on each compute node as it joins the pool.
9. Start task username: The user identity under which the start task runs.
10. Start task env settings: (Array) A list of environment variable settings for the start task.
11. Application: The application to be installed on each compute node in the pool.
13. Application Version: The version of the application to be installed on each compute node in the pool.


## Method: Delete Pool

**Description**

This method deletes a pool of compute nodes [For more info](https://docs.microsoft.com/en-us/rest/api/batchmanagement/pool/delete).

**Parameters**

1. Resource Group: The resource group that contains the Batch account.
2. Batch Account: The Batch account to create the pool in.
3. Pool Name: The name of the pool to delete.


## Method: Deploy Package To Pool

**Description**

This method updates the pool with the new application package refrence. [For more info](https://docs.microsoft.com/en-us/rest/api/batchmanagement/pool/update).

**Parameters**

1. Resource Group: The resource group that contains the Batch account.
2. Batch Account: The Batch account to create the pool in.
3. Pool Name: The name of the pool to update.
4. Application: The application to be installed on each compute node in the pool.
5. Application Version: The version of the application to be installed on each compute node in the pool.

## Method: Clone Pool

**Description**

This method gets the specification of an existing pool, and creates a new pool based on it. All parameters are optional and will be overriding the original pool options.

**Parameters**

1. Resource Group: The resource group that contains the Batch account.
2. Batch Account: The Batch account to create the pool in.
3. Pool: The pool to clone.
4. New Pool Name: The new of the new pool name. This must be unique within the account.
5. VM Size: (String), The size of virtual machines in the pool.
6. Dedicated Nodes: (Integer), The desired number of dedicated compute nodes in the pool.
At least one of targetDedicatedNodes, targetLowPriority nodes must be set.
7. Low Priority Nodes: (Integer), The desired number of low-priority compute nodes in the pool.
At least one of targetDedicatedNodes, targetLowPriority nodes must be set.

A reference to an Azure Virtual Machines Marketplace image or the Azure Image resource of a custom Virtual Machine. To get the list of all imageReferences verified by Azure Batch, see the 'List supported node agent SKUs' operation.

8. Image: The image to use for the new pool.

9. Start task commandLine: (String) A task specified to run on each compute node as it joins the pool.
10. Start task username: The user identity under which the start task runs.
11. Start task env settings: (Array) A list of environment variable settings for the start task.
12. Application: The application to be installed on each compute node in the pool.
13. Application Version: The version of the application to be installed on each compute node in the pool.