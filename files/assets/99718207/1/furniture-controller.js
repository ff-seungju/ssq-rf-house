class FurnitureController extends pc.ScriptType {
    initialize() {
        this.uiPivot = this.entity.findByTag("ui_pivot")[0];
        if (this.uiPivot) this.uiPivot.setLocalPosition(0, this.ui_pivot_y, 0);
    }
}

pc.registerScript(FurnitureController, 'furnitureController');

FurnitureController.attributes.add("ui_pivot_y", { type: 'number' });