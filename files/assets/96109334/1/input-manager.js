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
    if (raycastResults[0] && raycastResults[0].entity.tags.has("house_item"))
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
    if (!this.selected_item) {
      // 회수
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
      let raycastResult = this.app.systems.rigidbody.raycastFirst(start, end);
      console.log("raycastFirst", raycastResult);
      if (
        raycastResult.entity.tags.has("house_item") &&
        this.inputTarget.name === raycastResult.entity.setter
      ) {
        const uiPivot = raycastResult.entity.findByTag("ui_pivot")[0];
        const uiPosition = this._raycastCamera.worldToScreen(
          uiPivot.getPosition()
        );
        window.parent.postMessage(
          {
            type: "ask_collect_item",
            item_type: raycastResult.entity.type,
            oid: raycastResult.entity.name,
            ui_pos: [Math.floor(uiPosition.x), Math.floor(uiPosition.y)],
          },
          "*"
        );
      }
    } else {
      // 설치
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
      let filtered = raycastResults.filter((result) =>
        result.entity.tags.has("grid")
      );
      if (filtered.length > 0) {
        const pos = filtered[0].entity.getPosition();
        const intPos = [
          Math.round(pos.x * 10) / 10,
          0,
          Math.round(pos.z * 10) / 10,
        ];
        this.app.matchHandler.sendSetHouseItem(intPos, this.selected_item);
      }
    }
  }

  onMessage(message) {
    if (
      message.data.type !== "house_select_item" &&
      message.data.type !== "house_collect_item"
    )
      return;
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
      case "house_collect_item":
        this.selected_item = null;
        if (data.bool) this.isHouseEditting = true;
        else this.isHouseEditting = false;
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
