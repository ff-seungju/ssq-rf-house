class ObjectManager extends pc.ScriptType {
  initialize() {
    this._root = this.app.root.findByName("Root");
    this.app.objectManager = this;
    this.objectMap = new Map();

    window.addEventListener("message", this.onMessage.bind(this));
    this.on("destroy", () => {
      window.removeEventListener("message", this.onMessage.bind(this));
    });
  }

  spawn(object) {
    const template = this.item_table.find(
      (el) => el.name === "living_bed_02_double"
    );
    const pos = object.pos;
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

  destroy(oid) {
    const object = this.objectMap.get(oid);
    if (!object) return;
    this.objectMap.delete(oid);
    object.destroy();
  }

  onMessage(message) {
    if (message.data.type !== "collect_item") return;
    const data = message.data;
    switch (data.type) {
      case "collect_item":
        this.destroy(data.oid);
        break;
      default:
        break;
    }
  }
}

pc.registerScript(ObjectManager, "objectManager");

ObjectManager.attributes.add("item_table", {
  type: "asset",
  assetType: "template",
  array: true,
});
