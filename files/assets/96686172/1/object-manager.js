class ObjectManager extends pc.ScriptType {
  initialize() {
    this._root = this.app.root.findByName("Root");
    this.app.objectManager = this;
    this.objectMap = new Map();

    this.vec = new pc.Vec3();
    this.quat = new pc.Quat();

    window.addEventListener("message", this.onMessage.bind(this));
    this.on("destroy", () => {
      window.removeEventListener("message", this.onMessage.bind(this));
    });
  }

  spawn(object) {
    const template = this.item_config.find(
      (el) => el.item.name === "living_bed_02_double"
    );
    const pos = object.pos;
    const inst = template.item.resource.instantiate();
    inst.name = object.oid;
    inst.setter = object.setter;
    inst.type = object.type;

    const objectPos = new pc.Vec3();
    objectPos.set(pos[0], pos[1], pos[2]);
    if (inst.rigidbody) inst.rigidbody.teleport(objectPos);
    else inst.setPosition(objectPos);
    if (object.rotY !== 0) inst.setEulerAngles(0, object.rotY, 0);
    this.objectMap.set(object.oid, inst);
    this._root.addChild(inst);
  }

  rotate(oid, rotY) {
    const object = this.objectMap.get(oid);
    console.log("oid, rotY", oid, rotY);
    if (!object) return;
    this.vec.set(0, rotY, 0);
    this.quat.setFromEulerAngles(this.vec);
    object.setRotation(this.quat);
  }

  destroy(oid) {
    const object = this.objectMap.get(oid);
    if (!object) return;
    this.objectMap.delete(oid);
    object.destroy();
  }

  sendItemTable() {
    const itemList = [];
    this.item_config.forEach((config, i) => {
      itemList.push({
        id: i,
        title: config.item.name,
        price: config.price,
        type: config.type,
      });
    });
    window.parent.postMessage(
      {
        type: "get_house_shop",
        item_list: itemList,
      },
      "*"
    );
  }

  onMessage(message) {
    if (message.data.type !== "get_house_shop") return;
    const data = message.data;
    switch (data.type) {
      case "get_house_shop":
        this.sendItemTable();
        break;
      default:
        break;
    }
  }
}

pc.registerScript(ObjectManager, "objectManager");

ObjectManager.attributes.add("item_config", {
  type: "json",
  schema: [
    {
      name: "price",
      type: "number",
      default: 10,
    },
    {
      name: "item",
      type: "asset",
      assetType: "template",
    },
    {
      name: "type",
      type: "string",
      enum: [
        { bath: "bath" },
        { kitchen: "kitchen" },
        { living: "living" },
        { ground: "ground" },
        { wall: "wall" },
      ],
      default: "ground",
    },
  ],
  array: true,
});
