class DataRef extends pc.ScriptType { }

pc.registerScript(DataRef, 'dataRef');

DataRef.attributes.add("select_char", {
    type: 'json', schema: [{ name: 'model', type: 'asset', assetType: 'model' }
    ], array: true
});