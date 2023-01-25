export default class OperationDescriptor {
    /**
     * @type {BaseOperation} - Operation properties
     * @readonly
     */
    operation
    /**
     * @type {String} - Parent transaction hash
     * @readonly
     */
    txHash
    /**
     * @type {Number} - Application order
     * @readonly
     */
    order
    /**
     * @type {String} - Filter context
     * @readonly
     */
    context
    /**
     * @type {'none'|'account'|'asset'|'offer'} - Filter context type
     * @readonly
     */
    contextType
    /**
     * @type {Boolean} - True for unsubmitted|unsuccessful transactions
     * @readonly
     */
    isEphemeral
    /**
     * @type {Boolean} - Whether the enclosing transaction has been successfully executed
     * @readonly
     */
    successful
    /**
     * @type {ParsedTxDetails} - Reference to the parent parsed tx container
     */
    tx

    /**
     * Prepare descriptors for transaction operations
     * @param {BaseOperation[]} operations
     * @param {String} txHash
     * @param {String} context
     * @param {'none'|'account'|'asset'|'offer'} contextType
     * @param {Boolean} isEphemeral
     * @param {Boolean} successful
     * @return {OperationDescriptor[]}
     */
    static parseOperations(operations, txHash, context, contextType, isEphemeral, successful) {
        return operations.map((operation, i) => {
            const op = new OperationDescriptor()
            Object.assign(op, {
                txHash,
                order: i,
                operation,
                context,
                contextType,
                isEphemeral,
                successful
            })
            return op
        })
    }
}