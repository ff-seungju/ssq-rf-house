class InputManager extends pc.ScriptType {
  initialize() {
    this._raycastCamera = this.raycastCamera
      ? this.raycastCamera.findComponent("camera")
      : null;
    if (this.app.mouse) {
      this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    }

    this.isHouseEditting = false;
    this.selected_item = null;

    window.addEventListener("message", this.onMessage.bind(this));
    this.on("destroy", () => {
      window.removeEventListener("message", this.onMessage.bind(this));
    });
  }

  onMouseUp(ev) {
    if (ev.button === pc.MOUSEBUTTON_LEFT) {
      if (this.isHouseEditting) {
        this.setHouseItem(ev);
      } else {
        this.raycast(ev);
      }
    }
  }

  raycast(screenPosition) {
    const start = this._raycastCamera.screenToWorld(
      screenPosition.x,
      screenPosition.y,
      this._raycastCamera.nearClip
    );
    const end = this._raycastCamera.screenToWorld(
      screenPosition.x,
      screenPosition.y,
      200
    );

    let raycastResults = this.app.systems.rigidbody.raycastAll(start, end);
    raycastResults.sort(function (a, b) {
      return a.point.distance(start) > b.point.distance(start) ? 1 : -1;
    });
    raycastResults = raycastResults.filter(
      (result) =>
        result.point.distance(this.app.matchHandler.localPlayer.getPosition()) <
          20 && !result.entity.tags.has("prevent_raycast")
    );
    if (raycastResults[0] && raycastResults[0].entity.tags.has("self"))
      raycastResults.splice(0, 1);
    if (raycastResults[0] && raycastResults[0].entity.tags.has("player"))
      raycastResults.splice(0, 1);

    const ray0 = raycastResults[0];
    if (!ray0) return;
    const target = this.inputTarget ? this.inputTarget : this.entity;

    if (ray0.entity.tags.has("ground")) {
      target.fire("#move", ray0.point);
      const mh = this.app.matchHandler;
      if (mh.localPlayer) {
        mh.sendPlayerMove(ray0.point, false);
      }
    }
  }

  setHouseItem(screenPosition) {
    if (!this.selected_item) return;
    const start = this._raycastCamera.screenToWorld(
      screenPosition.x,
      screenPosition.y,
      this._raycastCamera.nearClip
    );
    const end = this._raycastCamera.screenToWorld(
      screenPosition.x,
      screenPosition.y,
      200
    );

    let raycastResults = this.app.systems.rigidbody.raycastAll(start, end);
    console.log("raycast result1", raycastResults);
    let filtered = raycastResults.filter((result) =>
      result.entity.tags.has("grid")
    );
    console.log("ray result", filtered);
    if (filtered.length > 0) {
      const pos = filtered[0].entity.getPosition();
      const intPos = [
        Math.round(pos.x * 10) / 10,
        0,
        Math.round(pos.z * 10) / 10,
      ];
      this.inputTarget.fire("house_set_item", intPos, this.selected_item);
      this.app.matchHandler.sendSetHouseItem(intPos, this.selected_item);
    }
  }

  onMessage(message) {
    console.log("message", message);
    if (message.data.type !== "house_select_item") return;
    const data = message.data;
    switch (data.type) {
      case "house_select_item":
        if (data.item) {
          this.isHouseEditting = true;
          this.selected_item = data.item;
          this.inputTarget.fire("house_select_item", data.item);
        } else {
          this.isHouseEditting = false;
          this.selected_item = null;
          this.inputTarget.fire("house_select_item");
        }
        break;
      default:
        break;
    }
  }
}

pc.registerScript(InputManager, "inputManager");

InputManager.attributes.add("raycastCamera", {
  type: "entity",
  title: "raycast camera",
});
InputManager.attributes.add("inputTarget", {
  type: "entity",
  title: "input target",
});
