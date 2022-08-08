class PlayerController extends pc.ScriptType {
  initialize() {
    this._root = this.app.root.findByName("Root");

    this.entity.on("#move", this.onMove, this);
    this.entity.on("#rotate", this.onRotate, this);
    this.model = this.entity.findByName("spawn_model");
    this.anim = this.model.anim;

    // MOVE
    this.gravityUp = new pc.Vec3(0, 1, 0);
    this.targetPosition = new pc.Vec3(0, 0, 0);
    this.idleFrame = 0;
    this.characterDirection = new pc.Vec3(0, 0, 0);

    // ROTATE
    this.targetRotation = this.entity.getLocalRotation();
    this.originalRotation = this.entity.getLocalRotation();
    this.entity.worldPosition = new pc.Vec3();

    // RAY
    this.rayFrom = this.entity.findByTag("ray_from")[0];
    this.rayTo = this.entity.findByTag("ray_to")[0];

    this.entity.canGetNumberTag = true;

    this.vector = new pc.Vec3();
    this.speed = 5;

    this.entity.on("house_select_item", this.onSelectHouseItem, this);
    this.grid_pos = new pc.Vec3();
    this.item_set_pos = new pc.Vec3();
    this.item_grid = this.entity.findByTag("item_grid")[0];
    this.isHouseEditting = false;
    this.house_material =
      this.app.assets.findByTag("house_material")[0].resource;
  }

  postUpdate() {
    if (this.originalRotation !== this.targetRotation) {
      this.orginalRotation = this.targetRotation;
      this.entity.setRotation(this.targetRotation);
    }
  }

  update(dt) {
    this.entity.worldPosition.copy(this.entity.getPosition());
    if (this.anim.getBoolean("run")) {
      let dist = this.vector;
      dist.copy(this.targetPosition).sub(this.entity.worldPosition);
      let delta = this.speed * dt;
      if (dist.lengthSq() > delta * delta) {
        dist.normalize();
        this.characterDirection.set(0, 0, 0).sub(dist);
        dist.mulScalar(delta);
        dist.add(this.entity.worldPosition);
        if (this.entity.rigidbody.enabled) {
          this.entity.rigidbody.teleport(dist);
        } else {
          this.entity.setPosition(dist);
        }
      } else {
        this.anim.setBoolean("run", false);
      }
    } else {
      this.updateDanceAnim();
    }

    if (this.isHouseEditting) {
      let x = 0;
      let z = 0;
      const pos = this.entity.getPosition();

      const decimalX = pos.x - Math.floor(pos.x);
      const decimalZ = pos.z - Math.floor(pos.z);

      if (decimalX >= 0.75) x = 1;
      else if (decimalX >= 0.25) x = 0.5;
      if (decimalZ >= 0.75) z = 1;
      else if (decimalZ >= 0.25) z = 0.5;

      this.item_grid.setPosition(
        Math.floor(pos.x) + x,
        0,
        Math.floor(pos.z) + z
      );

      this.item_grid.children.forEach((child) =>
        child.rigidbody.teleport(child.getPosition())
      );
    }
  }

  onMove(worldPosition, ext) {
    if (ext) {
      this.setTargetPosition(worldPosition);
      if (this.entity.rigidbody && this.entity.rigidbody.enabled)
        this.entity.rigidbody.teleport(worldPosition);
      else this.entity.setPosition(worldPosition);
      this.idleFrame = this.app.frame;
      this.anim.setBoolean("run", false);
      return;
    }
    if (worldPosition.distance(this.entity.worldPosition) < 0.1) return;
    this.setTargetPosition(worldPosition);
    if (this.currentDance) {
      this.anim.setBoolean(this.currentDance, false);
    }
    this.anim.setBoolean("run", true);
    const direction = this.targetPosition
      .clone()
      .sub(this.entity.worldPosition)
      .normalize();
    this.characterDirection
      .set(0, 0, 0)
      .sub(direction)
      .add(this.entity.worldPosition);
    this.entity.lookAt(this.characterDirection);
    // if (this.entity.rigidbody && this.entity.rigidbody.enabled) {
    //   this.entity.rigidbody.linearVelocity = direction.clone().mulScalar(5);
    // }
  }

  onRotate(targetRotation) {
    this.targetRotation = targetRotation;
    // console.log("targetRotation", targetRotation);
    // this.targetRotation = targetRotation;
  }

  setTargetPosition(x, y, z) {
    if (x instanceof pc.Vec3) {
      this.targetPosition.copy(x);
    } else if (Array.isArray(x)) {
      this.targetPosition.set(x[0], x[1], x[2]);
    } else {
      this.targetPosition.set(x, y, z);
    }
  }

  updateDanceAnim() {
    if (this.anim.getBoolean("run")) return;
    if (this.idleFrame + 700 === this.app.frame) {
      const dances = [
        "dance1",
        "dance2",
        "dance3",
        "dance4",
        "dance5",
        "dance6",
        "dance7",
        "dance8",
        "dance9",
        "dance10",
      ];
      this.currentDance = dances[getRandomInt(0, dances.length)];
      if (this.anim._parameters[this.currentDance]) {
        this.anim.setBoolean(this.currentDance, true);
      } else {
        if (this.anim._parameters["dance"] !== undefined)
          this.anim.setBoolean("dance1", true);
      }
    }
  }

  onSelectHouseItem(item) {
    if (item) {
      this.isHouseEditting = true;
      const gridPos = this.item_grid.getPosition().clone();
      const rotY = this.entity.getEulerAngles().y;
      this.item_grid.setRotation(0, 0, 0, 1);
      this.item_grid.enabled = true;

      this.house_material.opacity = 0.3;
      this.house_material.update();
    } else {
      this.isHouseEditting = false;
      this.item_grid.enabled = false;
      this.house_material.opacity = 1;
      this.house_material.update();
    }
  }
}

pc.registerScript(PlayerController, "playerController");
