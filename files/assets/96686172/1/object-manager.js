class ObjectManager extends pc.ScriptType {
  initialize() {
    this._root = this.app.root.findByName("Root");
    this.app.objectManager = this;
    this.objectMap = new Map();
  }

  spawn(object) {
    console.log("this item table", this.item_table);
    const template = this.item_table.find(
      (el) => el.name === "SM_Prop_Bed_single_02_H"
    );
    const pos = object.pos;
    console.log("template", template);
    const inst = template.resource.instantiate();
    inst.name = object.oid;
    inst.setter = object.setter;
    inst.type = object.type;

    const objectPos = new pc.Vec3();
    objectPos.set(pos[0], pos[1], pos[2]);

    if (inst.rigidbody) inst.rigidbody.teleport(objectPos);
    else inst.setPosition(objectPos);
    this.objectMap.set(object.oid, inst);
    this._root.addChild(inst);
  }
}

pc.registerScript(ObjectManager, "objectManager");

ObjectManager.attributes.add("item_table", {
  type: "asset",
  assetType: "template",
  array: true,
});
