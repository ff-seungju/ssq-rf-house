class OrthoCamera extends pc.ScriptType {
    initialize() {
        this.originPosition = this.entity.getPosition().clone();
        this.lookAtPosition = new pc.Vec3();
        this.calcPos = new pc.Vec3();
    }
    update(dt) {
        if (this.lookAt) {
            const lookAtPos = this.lookAt.getPosition().clone();
            this.calcPos.copy(this.originPosition);
            this.lookAtPosition.copy(this.calcPos).add(this.lookAt.getPosition());
            this.entity.setPosition(this.lookAtPosition);
            this.entity.lookAt(lookAtPos);
        }
    }
}

pc.registerScript(OrthoCamera, 'orthoCamera');

OrthoCamera.attributes.add("lookAt", { type: 'entity', title: 'lookAt' });