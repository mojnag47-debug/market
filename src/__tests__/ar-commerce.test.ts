import ARCommerce from '../../libs/ar-commerce/ar-commerce';
import { EventEmitter } from 'events';

// Mock three to avoid WebGL requirements
jest.mock('three', () => {
  class Object3D {
    public position = { copy: jest.fn() };
    public userData: any;
    applyMatrix4 = jest.fn();
  }
  class Scene {
    add = jest.fn();
  }
  class WebGLRenderer {
    public autoClear = false;
    public xr: any = { enabled: false, setSession: jest.fn() };
    constructor(_: any) {}
  }
  class BoxGeometry {}
  class MeshStandardMaterial { constructor(_: any) {} }
  class Mesh {
    public position = { copy: jest.fn() };
    public userData: any;
    constructor(_: any, __: any) {}
  }
  class Matrix4 { public elements = new Float32Array(16) }
  class Vector3 {}
  return { Object3D, Scene, WebGLRenderer, BoxGeometry, MeshStandardMaterial, Mesh, Matrix4, Vector3 };
});

function mockNavigatorXR(supported: boolean, session?: any) {
  (globalThis as any).navigator = {
    xr: {
      isSessionSupported: jest.fn().mockResolvedValue(supported),
      requestSession: jest.fn().mockResolvedValue(
        session ?? {
          addEventListener: jest.fn(),
          requestReferenceSpace: jest.fn().mockResolvedValue({ type: 'local' }),
          requestAnimationFrame: (cb: any) => {
            const frame: any = { createAnchor: jest.fn().mockResolvedValue({ id: 'anchor-1' }) };
            cb(0, frame);
          },
        }
      ),
    },
  };
}

describe('ARCommerce', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (globalThis as any).navigator;
  });

  it('isWebXRSupported returns false when navigator.xr unavailable', async () => {
    const ar = new ARCommerce();
    expect(await ar.isWebXRSupported()).toBe(false);
  });

  it('isWebXRSupported returns true when supported', async () => {
    mockNavigatorXR(true);
    const ar = new ARCommerce();
    await expect(ar.isWebXRSupported()).resolves.toBe(true);
  });

  it('initializeARSession throws when unsupported', async () => {
    const ar = new ARCommerce();
    await expect(ar.initializeARSession()).rejects.toBeTruthy();
  });

  it('initializeARSession sets up renderer/session and emits session-started', async () => {
    mockNavigatorXR(true);
    const ar = new ARCommerce();
    const started = new Promise<void>((resolve) => ar.once('session-started', () => resolve()));
    await ar.initializeARSession();
    await started;
    expect(ar.isInitialized).toBe(true);
    expect(ar.session).toBeTruthy();
  });

  it('createAnchor uses frame.createAnchor when available', async () => {
    mockNavigatorXR(true, {
      addEventListener: jest.fn(),
      requestReferenceSpace: jest.fn().mockResolvedValue({ type: 'local' }),
      requestAnimationFrame: (cb: any) => {
        const frame: any = { createAnchor: jest.fn().mockResolvedValue({ id: 'native-anchor' }) };
        cb(0, frame);
      },
    });
    const ar = new ARCommerce();
    await ar.initializeARSession();
    // @ts-ignore
    const { Matrix4 } = jest.requireMock('three');
    const anchor = await ar.createAnchor(new Matrix4());
    expect((anchor as any).id).toBe('native-anchor');
  });

  it('createAnchor falls back to Object3D when createAnchor not available', async () => {
    mockNavigatorXR(true, {
      addEventListener: jest.fn(),
      requestReferenceSpace: jest.fn().mockResolvedValue({ type: 'local' }),
      requestAnimationFrame: (cb: any) => {
        const frame: any = {}; // no createAnchor
        cb(0, frame);
      },
    });
    const ar = new ARCommerce();
    await ar.initializeARSession();
    // @ts-ignore
    const { Matrix4 } = jest.requireMock('three');
    const anchor = await ar.createAnchor(new Matrix4());
    expect(anchor).toBeTruthy();
  });

  it('placeProductInAR places a mesh and emits model-placed', async () => {
    mockNavigatorXR(true);
    const ar = new ARCommerce();
    await ar.initializeARSession();
    // @ts-ignore
    const { Vector3 } = jest.requireMock('three');
    const placed = new Promise<any>((resolve) => ar.once('model-placed', (e) => resolve(e)));
    const obj = ar.placeProductInAR('p1', new Vector3());
    const ev = await placed;
    expect(obj).toBeTruthy();
    expect(ev.productId).toBe('p1');
  });

  it('placeProductInAR throws if not initialized', () => {
    const ar = new ARCommerce();
    // @ts-ignore
    const { Vector3 } = jest.requireMock('three');
    expect(() => ar.placeProductInAR('p1', new Vector3())).toThrow();
  });
});
