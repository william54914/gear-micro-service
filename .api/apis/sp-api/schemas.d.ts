declare const AddInventory: {
    readonly body: {
        readonly description: "The object with the list of Inventory to be added";
        readonly type: "object";
        readonly properties: {
            readonly inventoryItems: {
                readonly description: "List of Inventory to be added";
                readonly type: "array";
                readonly items: {
                    readonly description: "An item in the list of inventory to be added.";
                    readonly type: "object";
                    readonly properties: {
                        readonly sellerSku: {
                            readonly description: "The seller SKU of the item.";
                            readonly type: "string";
                        };
                        readonly marketplaceId: {
                            readonly description: "The marketplaceId.";
                            readonly type: "string";
                        };
                        readonly quantity: {
                            readonly description: "The quantity of item to add.";
                            readonly type: "integer";
                        };
                    };
                    readonly required: readonly ["sellerSku", "marketplaceId", "quantity"];
                };
            };
        };
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly "x-amzn-idempotency-token": {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A unique token/requestId provided with each call to ensure idempotency.";
                };
            };
            readonly required: readonly ["x-amzn-idempotency-token"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the AddInventory operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the AddInventory operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "403": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the AddInventory operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the AddInventory operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "429": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the AddInventory operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the AddInventory operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "503": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the AddInventory operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const CreateInventoryItem: {
    readonly body: {
        readonly description: "An item to be created in the inventory.";
        readonly type: "object";
        readonly properties: {
            readonly sellerSku: {
                readonly description: "The seller SKU of the item.";
                readonly type: "string";
            };
            readonly marketplaceId: {
                readonly description: "The marketplaceId.";
                readonly type: "string";
            };
            readonly productName: {
                readonly description: "The name of the item.";
                readonly type: "string";
            };
        };
        readonly required: readonly ["sellerSku", "marketplaceId", "productName"];
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the CreateInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the CreateInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "403": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the CreateInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the CreateInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "429": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the CreateInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the CreateInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "503": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the CreateInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const DeleteInventoryItem: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly sellerSku: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A single seller SKU used for querying the specified seller SKU inventory summaries.";
                };
            };
            readonly required: readonly ["sellerSku"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly marketplaceId: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The marketplace ID for the marketplace for which the sellerSku is to be deleted.";
                };
            };
            readonly required: readonly ["marketplaceId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the DeleteInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the DeleteInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "403": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the DeleteInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the DeleteInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "429": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the DeleteInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the DeleteInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "503": {
            readonly type: "object";
            readonly properties: {
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The response schema for the DeleteInventoryItem operation.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetInventorySummaries: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly details: {
                    readonly type: "boolean";
                    readonly default: false;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "true to return inventory summaries with additional summarized inventory details and quantities. Otherwise, returns inventory summaries only (default value).";
                };
                readonly granularityType: {
                    readonly type: "string";
                    readonly enum: readonly ["Marketplace"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The granularity type for the inventory aggregation level.";
                };
                readonly granularityId: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The granularity ID for the inventory aggregation level.";
                };
                readonly startDateTime: {
                    readonly type: "string";
                    readonly format: "date-time";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A start date and time in ISO8601 format. If specified, all inventory summaries that have changed since then are returned. You must specify a date and time that is no earlier than 18 months prior to the date and time when you call the API. Note: Changes in inboundWorkingQuantity, inboundShippedQuantity and inboundReceivingQuantity are not detected.";
                };
                readonly sellerSkus: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly maxItems: 50;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A list of seller SKUs for which to return inventory summaries. You may specify up to 50 SKUs.";
                };
                readonly sellerSku: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "A single seller SKU used for querying the specified seller SKU inventory summaries.";
                };
                readonly nextToken: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "String token returned in the response of your previous request. The string token will expire 30 seconds after being created.";
                };
                readonly marketplaceIds: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly maxItems: 1;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The marketplace ID for the marketplace for which to return inventory summaries.";
                };
            };
            readonly required: readonly ["granularityType", "granularityId", "marketplaceIds"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly payload: {
                    readonly type: "object";
                    readonly required: readonly ["granularity", "inventorySummaries"];
                    readonly properties: {
                        readonly granularity: {
                            readonly type: "object";
                            readonly properties: {
                                readonly granularityType: {
                                    readonly type: "string";
                                    readonly description: "The granularity type for the inventory aggregation level.";
                                    readonly "x-docgen-enum-table-extension": readonly [{
                                        readonly value: "Marketplace";
                                        readonly description: "Marketplace";
                                    }];
                                };
                                readonly granularityId: {
                                    readonly type: "string";
                                    readonly description: "The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId.";
                                };
                            };
                            readonly description: "Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace.";
                        };
                        readonly inventorySummaries: {
                            readonly type: "array";
                            readonly description: "A list of inventory summaries.";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly asin: {
                                        readonly type: "string";
                                        readonly description: "The Amazon Standard Identification Number (ASIN) of an item.";
                                    };
                                    readonly fnSku: {
                                        readonly type: "string";
                                        readonly description: "Amazon's fulfillment network SKU identifier.";
                                    };
                                    readonly sellerSku: {
                                        readonly type: "string";
                                        readonly description: "The seller SKU of the item.";
                                    };
                                    readonly condition: {
                                        readonly type: "string";
                                        readonly description: "The condition of the item as described by the seller (for example, New Item).";
                                    };
                                    readonly inventoryDetails: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fulfillableQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The item quantity that can be picked, packed, and shipped.";
                                            };
                                            readonly inboundWorkingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment for which you have notified Amazon.";
                                            };
                                            readonly inboundShippedQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number.";
                                            };
                                            readonly inboundReceivingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed.";
                                            };
                                            readonly reservedQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalReservedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes.";
                                                    };
                                                    readonly pendingCustomerOrderQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units reserved for customer orders.";
                                                    };
                                                    readonly pendingTransshipmentQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units being transferred from one fulfillment center to another.";
                                                    };
                                                    readonly fcProcessingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units that have been sidelined at the fulfillment center for additional processing.";
                                                    };
                                                };
                                                readonly description: "The quantity of reserved inventory.";
                                            };
                                            readonly researchingQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalResearchingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units currently being researched in Amazon's fulfillment network.";
                                                    };
                                                    readonly researchingQuantityBreakdown: {
                                                        readonly type: "array";
                                                        readonly description: "A list of quantity details for items currently being researched.";
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly required: readonly ["name", "quantity"];
                                                            readonly properties: {
                                                                readonly name: {
                                                                    readonly type: "string";
                                                                    readonly description: "The duration of the research.\n\n`researchingQuantityInShortTerm` `researchingQuantityInMidTerm` `researchingQuantityInLongTerm`";
                                                                    readonly enum: readonly ["researchingQuantityInShortTerm", "researchingQuantityInMidTerm", "researchingQuantityInLongTerm"];
                                                                    readonly "x-docgen-enum-table-extension": readonly [{
                                                                        readonly value: "researchingQuantityInShortTerm";
                                                                        readonly description: "Short Term for 1-10 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInMidTerm";
                                                                        readonly description: "Mid Term for 11-20 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInLongTerm";
                                                                        readonly description: "Long Term for 21 days or longer.";
                                                                    }];
                                                                };
                                                                readonly quantity: {
                                                                    readonly type: "integer";
                                                                    readonly description: "The number of units.";
                                                                };
                                                            };
                                                            readonly description: "The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers.";
                                                        };
                                                    };
                                                };
                                                readonly description: "The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers.";
                                            };
                                            readonly unfulfillableQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalUnfulfillableQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network in unsellable condition.";
                                                    };
                                                    readonly customerDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in customer damaged disposition.";
                                                    };
                                                    readonly warehouseDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in warehouse damaged disposition.";
                                                    };
                                                    readonly distributorDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in distributor damaged disposition.";
                                                    };
                                                    readonly carrierDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in carrier damaged disposition.";
                                                    };
                                                    readonly defectiveQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in defective disposition.";
                                                    };
                                                    readonly expiredQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in expired disposition.";
                                                    };
                                                };
                                                readonly description: "The quantity of unfulfillable inventory.";
                                            };
                                        };
                                        readonly description: "Summarized inventory details. This object will not appear if the details parameter in the request is false.";
                                    };
                                    readonly lastUpdatedTime: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                        readonly description: "The date and time that any quantity was last updated.";
                                    };
                                    readonly productName: {
                                        readonly type: "string";
                                        readonly description: "The localized language product title of the item within the specific marketplace.";
                                    };
                                    readonly totalQuantity: {
                                        readonly type: "integer";
                                        readonly description: "The total number of units in an inbound shipment or in Amazon fulfillment centers.";
                                    };
                                    readonly stores: {
                                        readonly type: "array";
                                        readonly description: "A list of seller-enrolled stores that apply to this seller SKU.";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly description: "Inventory summary for a specific item.";
                            };
                        };
                    };
                    readonly description: "The payload schema for the getInventorySummaries operation.";
                };
                readonly pagination: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nextToken: {
                            readonly type: "string";
                            readonly description: "A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return.";
                        };
                    };
                    readonly description: "The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management.";
                };
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The Response schema.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly type: "object";
            readonly properties: {
                readonly payload: {
                    readonly type: "object";
                    readonly required: readonly ["granularity", "inventorySummaries"];
                    readonly properties: {
                        readonly granularity: {
                            readonly type: "object";
                            readonly properties: {
                                readonly granularityType: {
                                    readonly type: "string";
                                    readonly description: "The granularity type for the inventory aggregation level.";
                                    readonly "x-docgen-enum-table-extension": readonly [{
                                        readonly value: "Marketplace";
                                        readonly description: "Marketplace";
                                    }];
                                };
                                readonly granularityId: {
                                    readonly type: "string";
                                    readonly description: "The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId.";
                                };
                            };
                            readonly description: "Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace.";
                        };
                        readonly inventorySummaries: {
                            readonly type: "array";
                            readonly description: "A list of inventory summaries.";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly asin: {
                                        readonly type: "string";
                                        readonly description: "The Amazon Standard Identification Number (ASIN) of an item.";
                                    };
                                    readonly fnSku: {
                                        readonly type: "string";
                                        readonly description: "Amazon's fulfillment network SKU identifier.";
                                    };
                                    readonly sellerSku: {
                                        readonly type: "string";
                                        readonly description: "The seller SKU of the item.";
                                    };
                                    readonly condition: {
                                        readonly type: "string";
                                        readonly description: "The condition of the item as described by the seller (for example, New Item).";
                                    };
                                    readonly inventoryDetails: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fulfillableQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The item quantity that can be picked, packed, and shipped.";
                                            };
                                            readonly inboundWorkingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment for which you have notified Amazon.";
                                            };
                                            readonly inboundShippedQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number.";
                                            };
                                            readonly inboundReceivingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed.";
                                            };
                                            readonly reservedQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalReservedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes.";
                                                    };
                                                    readonly pendingCustomerOrderQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units reserved for customer orders.";
                                                    };
                                                    readonly pendingTransshipmentQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units being transferred from one fulfillment center to another.";
                                                    };
                                                    readonly fcProcessingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units that have been sidelined at the fulfillment center for additional processing.";
                                                    };
                                                };
                                                readonly description: "The quantity of reserved inventory.";
                                            };
                                            readonly researchingQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalResearchingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units currently being researched in Amazon's fulfillment network.";
                                                    };
                                                    readonly researchingQuantityBreakdown: {
                                                        readonly type: "array";
                                                        readonly description: "A list of quantity details for items currently being researched.";
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly required: readonly ["name", "quantity"];
                                                            readonly properties: {
                                                                readonly name: {
                                                                    readonly type: "string";
                                                                    readonly description: "The duration of the research.\n\n`researchingQuantityInShortTerm` `researchingQuantityInMidTerm` `researchingQuantityInLongTerm`";
                                                                    readonly enum: readonly ["researchingQuantityInShortTerm", "researchingQuantityInMidTerm", "researchingQuantityInLongTerm"];
                                                                    readonly "x-docgen-enum-table-extension": readonly [{
                                                                        readonly value: "researchingQuantityInShortTerm";
                                                                        readonly description: "Short Term for 1-10 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInMidTerm";
                                                                        readonly description: "Mid Term for 11-20 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInLongTerm";
                                                                        readonly description: "Long Term for 21 days or longer.";
                                                                    }];
                                                                };
                                                                readonly quantity: {
                                                                    readonly type: "integer";
                                                                    readonly description: "The number of units.";
                                                                };
                                                            };
                                                            readonly description: "The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers.";
                                                        };
                                                    };
                                                };
                                                readonly description: "The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers.";
                                            };
                                            readonly unfulfillableQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalUnfulfillableQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network in unsellable condition.";
                                                    };
                                                    readonly customerDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in customer damaged disposition.";
                                                    };
                                                    readonly warehouseDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in warehouse damaged disposition.";
                                                    };
                                                    readonly distributorDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in distributor damaged disposition.";
                                                    };
                                                    readonly carrierDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in carrier damaged disposition.";
                                                    };
                                                    readonly defectiveQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in defective disposition.";
                                                    };
                                                    readonly expiredQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in expired disposition.";
                                                    };
                                                };
                                                readonly description: "The quantity of unfulfillable inventory.";
                                            };
                                        };
                                        readonly description: "Summarized inventory details. This object will not appear if the details parameter in the request is false.";
                                    };
                                    readonly lastUpdatedTime: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                        readonly description: "The date and time that any quantity was last updated.";
                                    };
                                    readonly productName: {
                                        readonly type: "string";
                                        readonly description: "The localized language product title of the item within the specific marketplace.";
                                    };
                                    readonly totalQuantity: {
                                        readonly type: "integer";
                                        readonly description: "The total number of units in an inbound shipment or in Amazon fulfillment centers.";
                                    };
                                    readonly stores: {
                                        readonly type: "array";
                                        readonly description: "A list of seller-enrolled stores that apply to this seller SKU.";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly description: "Inventory summary for a specific item.";
                            };
                        };
                    };
                    readonly description: "The payload schema for the getInventorySummaries operation.";
                };
                readonly pagination: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nextToken: {
                            readonly type: "string";
                            readonly description: "A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return.";
                        };
                    };
                    readonly description: "The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management.";
                };
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The Response schema.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "403": {
            readonly type: "object";
            readonly properties: {
                readonly payload: {
                    readonly type: "object";
                    readonly required: readonly ["granularity", "inventorySummaries"];
                    readonly properties: {
                        readonly granularity: {
                            readonly type: "object";
                            readonly properties: {
                                readonly granularityType: {
                                    readonly type: "string";
                                    readonly description: "The granularity type for the inventory aggregation level.";
                                    readonly "x-docgen-enum-table-extension": readonly [{
                                        readonly value: "Marketplace";
                                        readonly description: "Marketplace";
                                    }];
                                };
                                readonly granularityId: {
                                    readonly type: "string";
                                    readonly description: "The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId.";
                                };
                            };
                            readonly description: "Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace.";
                        };
                        readonly inventorySummaries: {
                            readonly type: "array";
                            readonly description: "A list of inventory summaries.";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly asin: {
                                        readonly type: "string";
                                        readonly description: "The Amazon Standard Identification Number (ASIN) of an item.";
                                    };
                                    readonly fnSku: {
                                        readonly type: "string";
                                        readonly description: "Amazon's fulfillment network SKU identifier.";
                                    };
                                    readonly sellerSku: {
                                        readonly type: "string";
                                        readonly description: "The seller SKU of the item.";
                                    };
                                    readonly condition: {
                                        readonly type: "string";
                                        readonly description: "The condition of the item as described by the seller (for example, New Item).";
                                    };
                                    readonly inventoryDetails: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fulfillableQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The item quantity that can be picked, packed, and shipped.";
                                            };
                                            readonly inboundWorkingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment for which you have notified Amazon.";
                                            };
                                            readonly inboundShippedQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number.";
                                            };
                                            readonly inboundReceivingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed.";
                                            };
                                            readonly reservedQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalReservedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes.";
                                                    };
                                                    readonly pendingCustomerOrderQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units reserved for customer orders.";
                                                    };
                                                    readonly pendingTransshipmentQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units being transferred from one fulfillment center to another.";
                                                    };
                                                    readonly fcProcessingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units that have been sidelined at the fulfillment center for additional processing.";
                                                    };
                                                };
                                                readonly description: "The quantity of reserved inventory.";
                                            };
                                            readonly researchingQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalResearchingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units currently being researched in Amazon's fulfillment network.";
                                                    };
                                                    readonly researchingQuantityBreakdown: {
                                                        readonly type: "array";
                                                        readonly description: "A list of quantity details for items currently being researched.";
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly required: readonly ["name", "quantity"];
                                                            readonly properties: {
                                                                readonly name: {
                                                                    readonly type: "string";
                                                                    readonly description: "The duration of the research.\n\n`researchingQuantityInShortTerm` `researchingQuantityInMidTerm` `researchingQuantityInLongTerm`";
                                                                    readonly enum: readonly ["researchingQuantityInShortTerm", "researchingQuantityInMidTerm", "researchingQuantityInLongTerm"];
                                                                    readonly "x-docgen-enum-table-extension": readonly [{
                                                                        readonly value: "researchingQuantityInShortTerm";
                                                                        readonly description: "Short Term for 1-10 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInMidTerm";
                                                                        readonly description: "Mid Term for 11-20 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInLongTerm";
                                                                        readonly description: "Long Term for 21 days or longer.";
                                                                    }];
                                                                };
                                                                readonly quantity: {
                                                                    readonly type: "integer";
                                                                    readonly description: "The number of units.";
                                                                };
                                                            };
                                                            readonly description: "The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers.";
                                                        };
                                                    };
                                                };
                                                readonly description: "The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers.";
                                            };
                                            readonly unfulfillableQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalUnfulfillableQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network in unsellable condition.";
                                                    };
                                                    readonly customerDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in customer damaged disposition.";
                                                    };
                                                    readonly warehouseDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in warehouse damaged disposition.";
                                                    };
                                                    readonly distributorDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in distributor damaged disposition.";
                                                    };
                                                    readonly carrierDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in carrier damaged disposition.";
                                                    };
                                                    readonly defectiveQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in defective disposition.";
                                                    };
                                                    readonly expiredQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in expired disposition.";
                                                    };
                                                };
                                                readonly description: "The quantity of unfulfillable inventory.";
                                            };
                                        };
                                        readonly description: "Summarized inventory details. This object will not appear if the details parameter in the request is false.";
                                    };
                                    readonly lastUpdatedTime: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                        readonly description: "The date and time that any quantity was last updated.";
                                    };
                                    readonly productName: {
                                        readonly type: "string";
                                        readonly description: "The localized language product title of the item within the specific marketplace.";
                                    };
                                    readonly totalQuantity: {
                                        readonly type: "integer";
                                        readonly description: "The total number of units in an inbound shipment or in Amazon fulfillment centers.";
                                    };
                                    readonly stores: {
                                        readonly type: "array";
                                        readonly description: "A list of seller-enrolled stores that apply to this seller SKU.";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly description: "Inventory summary for a specific item.";
                            };
                        };
                    };
                    readonly description: "The payload schema for the getInventorySummaries operation.";
                };
                readonly pagination: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nextToken: {
                            readonly type: "string";
                            readonly description: "A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return.";
                        };
                    };
                    readonly description: "The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management.";
                };
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The Response schema.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly type: "object";
            readonly properties: {
                readonly payload: {
                    readonly type: "object";
                    readonly required: readonly ["granularity", "inventorySummaries"];
                    readonly properties: {
                        readonly granularity: {
                            readonly type: "object";
                            readonly properties: {
                                readonly granularityType: {
                                    readonly type: "string";
                                    readonly description: "The granularity type for the inventory aggregation level.";
                                    readonly "x-docgen-enum-table-extension": readonly [{
                                        readonly value: "Marketplace";
                                        readonly description: "Marketplace";
                                    }];
                                };
                                readonly granularityId: {
                                    readonly type: "string";
                                    readonly description: "The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId.";
                                };
                            };
                            readonly description: "Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace.";
                        };
                        readonly inventorySummaries: {
                            readonly type: "array";
                            readonly description: "A list of inventory summaries.";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly asin: {
                                        readonly type: "string";
                                        readonly description: "The Amazon Standard Identification Number (ASIN) of an item.";
                                    };
                                    readonly fnSku: {
                                        readonly type: "string";
                                        readonly description: "Amazon's fulfillment network SKU identifier.";
                                    };
                                    readonly sellerSku: {
                                        readonly type: "string";
                                        readonly description: "The seller SKU of the item.";
                                    };
                                    readonly condition: {
                                        readonly type: "string";
                                        readonly description: "The condition of the item as described by the seller (for example, New Item).";
                                    };
                                    readonly inventoryDetails: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fulfillableQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The item quantity that can be picked, packed, and shipped.";
                                            };
                                            readonly inboundWorkingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment for which you have notified Amazon.";
                                            };
                                            readonly inboundShippedQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number.";
                                            };
                                            readonly inboundReceivingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed.";
                                            };
                                            readonly reservedQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalReservedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes.";
                                                    };
                                                    readonly pendingCustomerOrderQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units reserved for customer orders.";
                                                    };
                                                    readonly pendingTransshipmentQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units being transferred from one fulfillment center to another.";
                                                    };
                                                    readonly fcProcessingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units that have been sidelined at the fulfillment center for additional processing.";
                                                    };
                                                };
                                                readonly description: "The quantity of reserved inventory.";
                                            };
                                            readonly researchingQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalResearchingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units currently being researched in Amazon's fulfillment network.";
                                                    };
                                                    readonly researchingQuantityBreakdown: {
                                                        readonly type: "array";
                                                        readonly description: "A list of quantity details for items currently being researched.";
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly required: readonly ["name", "quantity"];
                                                            readonly properties: {
                                                                readonly name: {
                                                                    readonly type: "string";
                                                                    readonly description: "The duration of the research.\n\n`researchingQuantityInShortTerm` `researchingQuantityInMidTerm` `researchingQuantityInLongTerm`";
                                                                    readonly enum: readonly ["researchingQuantityInShortTerm", "researchingQuantityInMidTerm", "researchingQuantityInLongTerm"];
                                                                    readonly "x-docgen-enum-table-extension": readonly [{
                                                                        readonly value: "researchingQuantityInShortTerm";
                                                                        readonly description: "Short Term for 1-10 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInMidTerm";
                                                                        readonly description: "Mid Term for 11-20 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInLongTerm";
                                                                        readonly description: "Long Term for 21 days or longer.";
                                                                    }];
                                                                };
                                                                readonly quantity: {
                                                                    readonly type: "integer";
                                                                    readonly description: "The number of units.";
                                                                };
                                                            };
                                                            readonly description: "The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers.";
                                                        };
                                                    };
                                                };
                                                readonly description: "The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers.";
                                            };
                                            readonly unfulfillableQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalUnfulfillableQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network in unsellable condition.";
                                                    };
                                                    readonly customerDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in customer damaged disposition.";
                                                    };
                                                    readonly warehouseDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in warehouse damaged disposition.";
                                                    };
                                                    readonly distributorDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in distributor damaged disposition.";
                                                    };
                                                    readonly carrierDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in carrier damaged disposition.";
                                                    };
                                                    readonly defectiveQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in defective disposition.";
                                                    };
                                                    readonly expiredQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in expired disposition.";
                                                    };
                                                };
                                                readonly description: "The quantity of unfulfillable inventory.";
                                            };
                                        };
                                        readonly description: "Summarized inventory details. This object will not appear if the details parameter in the request is false.";
                                    };
                                    readonly lastUpdatedTime: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                        readonly description: "The date and time that any quantity was last updated.";
                                    };
                                    readonly productName: {
                                        readonly type: "string";
                                        readonly description: "The localized language product title of the item within the specific marketplace.";
                                    };
                                    readonly totalQuantity: {
                                        readonly type: "integer";
                                        readonly description: "The total number of units in an inbound shipment or in Amazon fulfillment centers.";
                                    };
                                    readonly stores: {
                                        readonly type: "array";
                                        readonly description: "A list of seller-enrolled stores that apply to this seller SKU.";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly description: "Inventory summary for a specific item.";
                            };
                        };
                    };
                    readonly description: "The payload schema for the getInventorySummaries operation.";
                };
                readonly pagination: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nextToken: {
                            readonly type: "string";
                            readonly description: "A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return.";
                        };
                    };
                    readonly description: "The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management.";
                };
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The Response schema.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "429": {
            readonly type: "object";
            readonly properties: {
                readonly payload: {
                    readonly type: "object";
                    readonly required: readonly ["granularity", "inventorySummaries"];
                    readonly properties: {
                        readonly granularity: {
                            readonly type: "object";
                            readonly properties: {
                                readonly granularityType: {
                                    readonly type: "string";
                                    readonly description: "The granularity type for the inventory aggregation level.";
                                    readonly "x-docgen-enum-table-extension": readonly [{
                                        readonly value: "Marketplace";
                                        readonly description: "Marketplace";
                                    }];
                                };
                                readonly granularityId: {
                                    readonly type: "string";
                                    readonly description: "The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId.";
                                };
                            };
                            readonly description: "Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace.";
                        };
                        readonly inventorySummaries: {
                            readonly type: "array";
                            readonly description: "A list of inventory summaries.";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly asin: {
                                        readonly type: "string";
                                        readonly description: "The Amazon Standard Identification Number (ASIN) of an item.";
                                    };
                                    readonly fnSku: {
                                        readonly type: "string";
                                        readonly description: "Amazon's fulfillment network SKU identifier.";
                                    };
                                    readonly sellerSku: {
                                        readonly type: "string";
                                        readonly description: "The seller SKU of the item.";
                                    };
                                    readonly condition: {
                                        readonly type: "string";
                                        readonly description: "The condition of the item as described by the seller (for example, New Item).";
                                    };
                                    readonly inventoryDetails: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fulfillableQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The item quantity that can be picked, packed, and shipped.";
                                            };
                                            readonly inboundWorkingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment for which you have notified Amazon.";
                                            };
                                            readonly inboundShippedQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number.";
                                            };
                                            readonly inboundReceivingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed.";
                                            };
                                            readonly reservedQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalReservedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes.";
                                                    };
                                                    readonly pendingCustomerOrderQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units reserved for customer orders.";
                                                    };
                                                    readonly pendingTransshipmentQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units being transferred from one fulfillment center to another.";
                                                    };
                                                    readonly fcProcessingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units that have been sidelined at the fulfillment center for additional processing.";
                                                    };
                                                };
                                                readonly description: "The quantity of reserved inventory.";
                                            };
                                            readonly researchingQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalResearchingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units currently being researched in Amazon's fulfillment network.";
                                                    };
                                                    readonly researchingQuantityBreakdown: {
                                                        readonly type: "array";
                                                        readonly description: "A list of quantity details for items currently being researched.";
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly required: readonly ["name", "quantity"];
                                                            readonly properties: {
                                                                readonly name: {
                                                                    readonly type: "string";
                                                                    readonly description: "The duration of the research.\n\n`researchingQuantityInShortTerm` `researchingQuantityInMidTerm` `researchingQuantityInLongTerm`";
                                                                    readonly enum: readonly ["researchingQuantityInShortTerm", "researchingQuantityInMidTerm", "researchingQuantityInLongTerm"];
                                                                    readonly "x-docgen-enum-table-extension": readonly [{
                                                                        readonly value: "researchingQuantityInShortTerm";
                                                                        readonly description: "Short Term for 1-10 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInMidTerm";
                                                                        readonly description: "Mid Term for 11-20 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInLongTerm";
                                                                        readonly description: "Long Term for 21 days or longer.";
                                                                    }];
                                                                };
                                                                readonly quantity: {
                                                                    readonly type: "integer";
                                                                    readonly description: "The number of units.";
                                                                };
                                                            };
                                                            readonly description: "The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers.";
                                                        };
                                                    };
                                                };
                                                readonly description: "The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers.";
                                            };
                                            readonly unfulfillableQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalUnfulfillableQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network in unsellable condition.";
                                                    };
                                                    readonly customerDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in customer damaged disposition.";
                                                    };
                                                    readonly warehouseDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in warehouse damaged disposition.";
                                                    };
                                                    readonly distributorDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in distributor damaged disposition.";
                                                    };
                                                    readonly carrierDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in carrier damaged disposition.";
                                                    };
                                                    readonly defectiveQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in defective disposition.";
                                                    };
                                                    readonly expiredQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in expired disposition.";
                                                    };
                                                };
                                                readonly description: "The quantity of unfulfillable inventory.";
                                            };
                                        };
                                        readonly description: "Summarized inventory details. This object will not appear if the details parameter in the request is false.";
                                    };
                                    readonly lastUpdatedTime: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                        readonly description: "The date and time that any quantity was last updated.";
                                    };
                                    readonly productName: {
                                        readonly type: "string";
                                        readonly description: "The localized language product title of the item within the specific marketplace.";
                                    };
                                    readonly totalQuantity: {
                                        readonly type: "integer";
                                        readonly description: "The total number of units in an inbound shipment or in Amazon fulfillment centers.";
                                    };
                                    readonly stores: {
                                        readonly type: "array";
                                        readonly description: "A list of seller-enrolled stores that apply to this seller SKU.";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly description: "Inventory summary for a specific item.";
                            };
                        };
                    };
                    readonly description: "The payload schema for the getInventorySummaries operation.";
                };
                readonly pagination: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nextToken: {
                            readonly type: "string";
                            readonly description: "A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return.";
                        };
                    };
                    readonly description: "The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management.";
                };
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The Response schema.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly type: "object";
            readonly properties: {
                readonly payload: {
                    readonly type: "object";
                    readonly required: readonly ["granularity", "inventorySummaries"];
                    readonly properties: {
                        readonly granularity: {
                            readonly type: "object";
                            readonly properties: {
                                readonly granularityType: {
                                    readonly type: "string";
                                    readonly description: "The granularity type for the inventory aggregation level.";
                                    readonly "x-docgen-enum-table-extension": readonly [{
                                        readonly value: "Marketplace";
                                        readonly description: "Marketplace";
                                    }];
                                };
                                readonly granularityId: {
                                    readonly type: "string";
                                    readonly description: "The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId.";
                                };
                            };
                            readonly description: "Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace.";
                        };
                        readonly inventorySummaries: {
                            readonly type: "array";
                            readonly description: "A list of inventory summaries.";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly asin: {
                                        readonly type: "string";
                                        readonly description: "The Amazon Standard Identification Number (ASIN) of an item.";
                                    };
                                    readonly fnSku: {
                                        readonly type: "string";
                                        readonly description: "Amazon's fulfillment network SKU identifier.";
                                    };
                                    readonly sellerSku: {
                                        readonly type: "string";
                                        readonly description: "The seller SKU of the item.";
                                    };
                                    readonly condition: {
                                        readonly type: "string";
                                        readonly description: "The condition of the item as described by the seller (for example, New Item).";
                                    };
                                    readonly inventoryDetails: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fulfillableQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The item quantity that can be picked, packed, and shipped.";
                                            };
                                            readonly inboundWorkingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment for which you have notified Amazon.";
                                            };
                                            readonly inboundShippedQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number.";
                                            };
                                            readonly inboundReceivingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed.";
                                            };
                                            readonly reservedQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalReservedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes.";
                                                    };
                                                    readonly pendingCustomerOrderQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units reserved for customer orders.";
                                                    };
                                                    readonly pendingTransshipmentQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units being transferred from one fulfillment center to another.";
                                                    };
                                                    readonly fcProcessingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units that have been sidelined at the fulfillment center for additional processing.";
                                                    };
                                                };
                                                readonly description: "The quantity of reserved inventory.";
                                            };
                                            readonly researchingQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalResearchingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units currently being researched in Amazon's fulfillment network.";
                                                    };
                                                    readonly researchingQuantityBreakdown: {
                                                        readonly type: "array";
                                                        readonly description: "A list of quantity details for items currently being researched.";
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly required: readonly ["name", "quantity"];
                                                            readonly properties: {
                                                                readonly name: {
                                                                    readonly type: "string";
                                                                    readonly description: "The duration of the research.\n\n`researchingQuantityInShortTerm` `researchingQuantityInMidTerm` `researchingQuantityInLongTerm`";
                                                                    readonly enum: readonly ["researchingQuantityInShortTerm", "researchingQuantityInMidTerm", "researchingQuantityInLongTerm"];
                                                                    readonly "x-docgen-enum-table-extension": readonly [{
                                                                        readonly value: "researchingQuantityInShortTerm";
                                                                        readonly description: "Short Term for 1-10 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInMidTerm";
                                                                        readonly description: "Mid Term for 11-20 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInLongTerm";
                                                                        readonly description: "Long Term for 21 days or longer.";
                                                                    }];
                                                                };
                                                                readonly quantity: {
                                                                    readonly type: "integer";
                                                                    readonly description: "The number of units.";
                                                                };
                                                            };
                                                            readonly description: "The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers.";
                                                        };
                                                    };
                                                };
                                                readonly description: "The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers.";
                                            };
                                            readonly unfulfillableQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalUnfulfillableQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network in unsellable condition.";
                                                    };
                                                    readonly customerDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in customer damaged disposition.";
                                                    };
                                                    readonly warehouseDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in warehouse damaged disposition.";
                                                    };
                                                    readonly distributorDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in distributor damaged disposition.";
                                                    };
                                                    readonly carrierDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in carrier damaged disposition.";
                                                    };
                                                    readonly defectiveQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in defective disposition.";
                                                    };
                                                    readonly expiredQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in expired disposition.";
                                                    };
                                                };
                                                readonly description: "The quantity of unfulfillable inventory.";
                                            };
                                        };
                                        readonly description: "Summarized inventory details. This object will not appear if the details parameter in the request is false.";
                                    };
                                    readonly lastUpdatedTime: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                        readonly description: "The date and time that any quantity was last updated.";
                                    };
                                    readonly productName: {
                                        readonly type: "string";
                                        readonly description: "The localized language product title of the item within the specific marketplace.";
                                    };
                                    readonly totalQuantity: {
                                        readonly type: "integer";
                                        readonly description: "The total number of units in an inbound shipment or in Amazon fulfillment centers.";
                                    };
                                    readonly stores: {
                                        readonly type: "array";
                                        readonly description: "A list of seller-enrolled stores that apply to this seller SKU.";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly description: "Inventory summary for a specific item.";
                            };
                        };
                    };
                    readonly description: "The payload schema for the getInventorySummaries operation.";
                };
                readonly pagination: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nextToken: {
                            readonly type: "string";
                            readonly description: "A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return.";
                        };
                    };
                    readonly description: "The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management.";
                };
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The Response schema.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "503": {
            readonly type: "object";
            readonly properties: {
                readonly payload: {
                    readonly type: "object";
                    readonly required: readonly ["granularity", "inventorySummaries"];
                    readonly properties: {
                        readonly granularity: {
                            readonly type: "object";
                            readonly properties: {
                                readonly granularityType: {
                                    readonly type: "string";
                                    readonly description: "The granularity type for the inventory aggregation level.";
                                    readonly "x-docgen-enum-table-extension": readonly [{
                                        readonly value: "Marketplace";
                                        readonly description: "Marketplace";
                                    }];
                                };
                                readonly granularityId: {
                                    readonly type: "string";
                                    readonly description: "The granularity ID for the specified granularity type. When granularityType is Marketplace, specify the marketplaceId.";
                                };
                            };
                            readonly description: "Describes a granularity at which inventory data can be aggregated. For example, if you use Marketplace granularity, the fulfillable quantity will reflect inventory that could be fulfilled in the given marketplace.";
                        };
                        readonly inventorySummaries: {
                            readonly type: "array";
                            readonly description: "A list of inventory summaries.";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly asin: {
                                        readonly type: "string";
                                        readonly description: "The Amazon Standard Identification Number (ASIN) of an item.";
                                    };
                                    readonly fnSku: {
                                        readonly type: "string";
                                        readonly description: "Amazon's fulfillment network SKU identifier.";
                                    };
                                    readonly sellerSku: {
                                        readonly type: "string";
                                        readonly description: "The seller SKU of the item.";
                                    };
                                    readonly condition: {
                                        readonly type: "string";
                                        readonly description: "The condition of the item as described by the seller (for example, New Item).";
                                    };
                                    readonly inventoryDetails: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly fulfillableQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The item quantity that can be picked, packed, and shipped.";
                                            };
                                            readonly inboundWorkingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment for which you have notified Amazon.";
                                            };
                                            readonly inboundShippedQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units in an inbound shipment that you have notified Amazon about and have provided a tracking number.";
                                            };
                                            readonly inboundReceivingQuantity: {
                                                readonly type: "integer";
                                                readonly description: "The number of units that have not yet been received at an Amazon fulfillment center for processing, but are part of an inbound shipment with some units that have already been received and processed.";
                                            };
                                            readonly reservedQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalReservedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network that are currently being picked, packed, and shipped; or are sidelined for measurement, sampling, or other internal processes.";
                                                    };
                                                    readonly pendingCustomerOrderQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units reserved for customer orders.";
                                                    };
                                                    readonly pendingTransshipmentQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units being transferred from one fulfillment center to another.";
                                                    };
                                                    readonly fcProcessingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units that have been sidelined at the fulfillment center for additional processing.";
                                                    };
                                                };
                                                readonly description: "The quantity of reserved inventory.";
                                            };
                                            readonly researchingQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalResearchingQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units currently being researched in Amazon's fulfillment network.";
                                                    };
                                                    readonly researchingQuantityBreakdown: {
                                                        readonly type: "array";
                                                        readonly description: "A list of quantity details for items currently being researched.";
                                                        readonly items: {
                                                            readonly type: "object";
                                                            readonly required: readonly ["name", "quantity"];
                                                            readonly properties: {
                                                                readonly name: {
                                                                    readonly type: "string";
                                                                    readonly description: "The duration of the research.\n\n`researchingQuantityInShortTerm` `researchingQuantityInMidTerm` `researchingQuantityInLongTerm`";
                                                                    readonly enum: readonly ["researchingQuantityInShortTerm", "researchingQuantityInMidTerm", "researchingQuantityInLongTerm"];
                                                                    readonly "x-docgen-enum-table-extension": readonly [{
                                                                        readonly value: "researchingQuantityInShortTerm";
                                                                        readonly description: "Short Term for 1-10 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInMidTerm";
                                                                        readonly description: "Mid Term for 11-20 days.";
                                                                    }, {
                                                                        readonly value: "researchingQuantityInLongTerm";
                                                                        readonly description: "Long Term for 21 days or longer.";
                                                                    }];
                                                                };
                                                                readonly quantity: {
                                                                    readonly type: "integer";
                                                                    readonly description: "The number of units.";
                                                                };
                                                            };
                                                            readonly description: "The misplaced or warehouse damaged inventory that is actively being confirmed at our fulfillment centers.";
                                                        };
                                                    };
                                                };
                                                readonly description: "The number of misplaced or warehouse damaged units that are actively being confirmed at our fulfillment centers.";
                                            };
                                            readonly unfulfillableQuantity: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly totalUnfulfillableQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The total number of units in Amazon's fulfillment network in unsellable condition.";
                                                    };
                                                    readonly customerDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in customer damaged disposition.";
                                                    };
                                                    readonly warehouseDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in warehouse damaged disposition.";
                                                    };
                                                    readonly distributorDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in distributor damaged disposition.";
                                                    };
                                                    readonly carrierDamagedQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in carrier damaged disposition.";
                                                    };
                                                    readonly defectiveQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in defective disposition.";
                                                    };
                                                    readonly expiredQuantity: {
                                                        readonly type: "integer";
                                                        readonly description: "The number of units in expired disposition.";
                                                    };
                                                };
                                                readonly description: "The quantity of unfulfillable inventory.";
                                            };
                                        };
                                        readonly description: "Summarized inventory details. This object will not appear if the details parameter in the request is false.";
                                    };
                                    readonly lastUpdatedTime: {
                                        readonly type: "string";
                                        readonly format: "date-time";
                                        readonly description: "The date and time that any quantity was last updated.";
                                    };
                                    readonly productName: {
                                        readonly type: "string";
                                        readonly description: "The localized language product title of the item within the specific marketplace.";
                                    };
                                    readonly totalQuantity: {
                                        readonly type: "integer";
                                        readonly description: "The total number of units in an inbound shipment or in Amazon fulfillment centers.";
                                    };
                                    readonly stores: {
                                        readonly type: "array";
                                        readonly description: "A list of seller-enrolled stores that apply to this seller SKU.";
                                        readonly items: {
                                            readonly type: "string";
                                        };
                                    };
                                };
                                readonly description: "Inventory summary for a specific item.";
                            };
                        };
                    };
                    readonly description: "The payload schema for the getInventorySummaries operation.";
                };
                readonly pagination: {
                    readonly type: "object";
                    readonly properties: {
                        readonly nextToken: {
                            readonly type: "string";
                            readonly description: "A generated string used to retrieve the next page of the result. If nextToken is returned, pass the value of nextToken to the next request. If nextToken is not returned, there are no more items to return.";
                        };
                    };
                    readonly description: "The process of returning the results to a request in batches of a defined size called pages. This is done to exercise some control over result size and overall throughput. It's a form of traffic management.";
                };
                readonly errors: {
                    readonly type: "array";
                    readonly description: "A list of error responses returned when a request is unsuccessful.";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["code"];
                        readonly properties: {
                            readonly code: {
                                readonly type: "string";
                                readonly description: "An error code that identifies the type of error that occurred.";
                            };
                            readonly message: {
                                readonly type: "string";
                                readonly description: "A message that describes the error condition in a human-readable form.";
                            };
                            readonly details: {
                                readonly type: "string";
                                readonly description: "Additional information that can help the caller understand or fix the issue.";
                            };
                        };
                        readonly description: "An error response returned when the request is unsuccessful.";
                    };
                };
            };
            readonly description: "The Response schema.";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
export { AddInventory, CreateInventoryItem, DeleteInventoryItem, GetInventorySummaries };
