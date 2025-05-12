"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var oas_1 = __importDefault(require("oas"));
var core_1 = __importDefault(require("api/dist/core"));
var openapi_json_1 = __importDefault(require("./openapi.json"));
var SDK = /** @class */ (function () {
    function SDK() {
        this.spec = oas_1.default.init(openapi_json_1.default);
        this.core = new core_1.default(this.spec, 'sp-api/v1 (api/6.1.3)');
    }
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    SDK.prototype.config = function (config) {
        this.core.setConfig(config);
    };
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    SDK.prototype.auth = function () {
        var _a;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        (_a = this.core).setAuth.apply(_a, values);
        return this;
    };
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    SDK.prototype.server = function (url, variables) {
        if (variables === void 0) { variables = {}; }
        this.core.setServer(url, variables);
    };
    /**
     * Returns a list of inventory summaries. The summaries returned depend on the presence or
     * absence of the startDateTime, sellerSkus and sellerSku parameters:
     *
     * - All inventory summaries with available details are returned when the startDateTime,
     * sellerSkus and sellerSku parameters are omitted.
     * - When startDateTime is provided, the operation returns inventory summaries that have
     * had changes after the date and time specified. The sellerSkus and sellerSku parameters
     * are ignored. Important: To avoid errors, use both startDateTime and nextToken to get the
     * next page of inventory summaries that have changed after the date and time specified.
     * - When the sellerSkus parameter is provided, the operation returns inventory summaries
     * for only the specified sellerSkus. The sellerSku parameter is ignored.
     * - When the sellerSku parameter is provided, the operation returns inventory summaries
     * for only the specified sellerSku.
     *
     * Note: The parameters associated with this operation may contain special characters that
     * must be encoded to successfully call the API. To avoid errors with SKUs when encoding
     * URLs, refer to [URL
     * Encoding](https://developer-docs.amazon.com/sp-api/docs/url-encoding).
     *
     * Usage Plan:
     *
     * | Rate (requests per second) | Burst |
     * | ---- | ---- |
     * | 2 | 2 |
     *
     * The x-amzn-RateLimit-Limit response header returns the usage plan rate limits that were
     * applied to the requested operation, when available. The table above indicates the
     * default rate and burst values for this operation. Selling partners whose business
     * demands require higher throughput may see higher rate and burst values than those shown
     * here. For more information, see [Usage Plans and Rate Limits in the Selling Partner
     * API](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits).
     *
     * @summary getInventorySummaries
     * @throws FetchError<400, types.GetInventorySummariesResponse400> Request has missing or invalid parameters and cannot be parsed.
     * @throws FetchError<403, types.GetInventorySummariesResponse403> Indicates access to the resource is forbidden. Possible reasons include Access Denied,
     * Unauthorized, Expired Token, Invalid Signature or Resource Not Found.
     * @throws FetchError<404, types.GetInventorySummariesResponse404> The specified resource does not exist.
     * @throws FetchError<429, types.GetInventorySummariesResponse429> The frequency of requests was greater than allowed.
     * @throws FetchError<500, types.GetInventorySummariesResponse500> An unexpected condition occurred that prevented the server from fulfilling the request.
     * @throws FetchError<503, types.GetInventorySummariesResponse503> Temporary overloading or maintenance of the server.
     */
    SDK.prototype.getInventorySummaries = function (metadata) {
        return this.core.fetch('/fba/inventory/v1/summaries', 'get', metadata);
    };
    /**
     * Requests that Amazon create product-details in the Sandbox Inventory in the sandbox
     * environment. This is a sandbox-only operation and must be directed to a sandbox
     * endpoint. Refer to [Selling Partner API
     * sandbox](https://developer-docs.amazon.com/sp-api/docs/the-selling-partner-api-sandbox)
     * for more information.
     *
     * @summary createInventoryItem
     * @throws FetchError<400, types.CreateInventoryItemResponse400> Request has missing or invalid parameters and cannot be parsed.
     * @throws FetchError<403, types.CreateInventoryItemResponse403> Indicates access to the resource is forbidden. Possible reasons include Access Denied,
     * Unauthorized, Expired Token, Invalid Signature or Resource Not Found.
     * @throws FetchError<404, types.CreateInventoryItemResponse404> The specified resource does not exist.
     * @throws FetchError<429, types.CreateInventoryItemResponse429> The frequency of requests was greater than allowed.
     * @throws FetchError<500, types.CreateInventoryItemResponse500> An unexpected condition occurred that prevented the server from fulfilling the request.
     * @throws FetchError<503, types.CreateInventoryItemResponse503> Temporary overloading or maintenance of the server.
     */
    SDK.prototype.createInventoryItem = function (body) {
        return this.core.fetch('/fba/inventory/v1/items', 'post', body);
    };
    /**
     * Requests that Amazon Deletes an item from the Sandbox Inventory in the sandbox
     * environment. This is a sandbox-only operation and must be directed to a sandbox
     * endpoint. Refer to [Selling Partner API
     * sandbox](https://developer-docs.amazon.com/sp-api/docs/the-selling-partner-api-sandbox)
     * for more information.
     *
     * @summary deleteInventoryItem
     * @throws FetchError<400, types.DeleteInventoryItemResponse400> Request has missing or invalid parameters and cannot be parsed.
     * @throws FetchError<403, types.DeleteInventoryItemResponse403> Indicates access to the resource is forbidden. Possible reasons include Access Denied,
     * Unauthorized, Expired Token, Invalid Signature or Resource Not Found.
     * @throws FetchError<404, types.DeleteInventoryItemResponse404> The specified resource does not exist.
     * @throws FetchError<429, types.DeleteInventoryItemResponse429> The frequency of requests was greater than allowed.
     * @throws FetchError<500, types.DeleteInventoryItemResponse500> An unexpected condition occurred that prevented the server from fulfilling the request.
     * @throws FetchError<503, types.DeleteInventoryItemResponse503> Temporary overloading or maintenance of the server.
     */
    SDK.prototype.deleteInventoryItem = function (metadata) {
        return this.core.fetch('/fba/inventory/v1/items/{sellerSku}', 'delete', metadata);
    };
    /**
     * Requests that Amazon add items to the Sandbox Inventory with desired amount of quantity
     * in the sandbox environment. This is a sandbox-only operation and must be directed to a
     * sandbox endpoint. Refer to [Selling Partner API
     * sandbox](https://developer-docs.amazon.com/sp-api/docs/the-selling-partner-api-sandbox)
     * for more information.
     *
     * @summary addInventory
     * @throws FetchError<400, types.AddInventoryResponse400> Request has missing or invalid parameters and cannot be parsed.
     * @throws FetchError<403, types.AddInventoryResponse403> Indicates access to the resource is forbidden. Possible reasons include Access Denied,
     * Unauthorized, Expired Token, Invalid Signature or Resource Not Found.
     * @throws FetchError<404, types.AddInventoryResponse404> The specified resource does not exist.
     * @throws FetchError<429, types.AddInventoryResponse429> The frequency of requests was greater than allowed.
     * @throws FetchError<500, types.AddInventoryResponse500> An unexpected condition occurred that prevented the server from fulfilling the request.
     * @throws FetchError<503, types.AddInventoryResponse503> Temporary overloading or maintenance of the server.
     */
    SDK.prototype.addInventory = function (body, metadata) {
        return this.core.fetch('/fba/inventory/v1/items/inventory', 'post', body, metadata);
    };
    return SDK;
}());
var createSDK = (function () { return new SDK(); })();
module.exports = createSDK;
