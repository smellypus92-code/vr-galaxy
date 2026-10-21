/**
 * Input manager for CyberStrike VR.
 * Supports desktop keyboard/mouse (Pointer Lock), touch events,
 * and tracks continuous held inputs vs edge-triggered justPressed actions.
 */

export class InputManager {
  private keysHeld: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private mouseButtonsHeld: Set<number> = new Set();
  private mouseButtonsJustPressed: Set<number> = new Set();

  public mouseDeltaX = 0;
  public mouseDeltaY = 0;
  public isPointerLocked = false;
  private canvasElement: HTMLCanvasElement | null = null;

  // Mobile virtual sticks
  public touchMoveX = 0;
  public touchMoveZ = 0;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
  }

  public attachCanvas(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas;
    canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public requestPointerLock() {
    if (this.canvasElement && !this.isPointerLocked) {
      try {
        this.canvasElement.requestPointerLock();
      } catch {
        // Pointer lock rejected or not supported
      }
    }
  }

  public exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  private handlePointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.canvasElement;
  }

  private handleKeyDown(e: KeyboardEvent) {
    const code = e.code;
    if (!this.keysHeld.has(code)) {
      this.keysJustPressed.add(code);
    }
    this.keysHeld.add(code);

    // Prevent default scrolling for game keys
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
      e.preventDefault();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keysHeld.delete(e.code);
  }

  private handleMouseDown(e: MouseEvent) {
    if (!this.mouseButtonsHeld.has(e.button)) {
      this.mouseButtonsJustPressed.add(e.button);
    }
    this.mouseButtonsHeld.add(e.button);
  }

  private handleMouseUp(e: MouseEvent) {
    this.mouseButtonsHeld.delete(e.button);
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isPointerLocked) {
      this.mouseDeltaX += e.movementX;
      this.mouseDeltaY += e.movementY;
    }
  }

  private handleBlur() {
    this.keysHeld.clear();
    this.keysJustPressed.clear();
    this.mouseButtonsHeld.clear();
    this.mouseButtonsJustPressed.clear();
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }

  public isKey(code: string): boolean {
    return this.keysHeld.has(code);
  }

  public wasKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }

  public isMouseDown(button = 0): boolean {
    return this.mouseButtonsHeld.has(button);
  }

  public wasMouseJustPressed(button = 0): boolean {
    return this.mouseButtonsJustPressed.has(button);
  }

  // Call at end of each simulation frame
  public endFrame() {
    this.keysJustPressed.clear();
    this.mouseButtonsJustPressed.clear();
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
  }
}
