var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// deno:file:///home/rigel/projects/morphopoiesis.art/site/lib/poiesis/utils/geometry.ts
var square = /* @__PURE__ */ __name((x) => {
  return [
    -x,
    -x,
    x,
    -x,
    x,
    x,
    -x,
    -x,
    x,
    x,
    -x,
    x
  ];
}, "square");

// deno:file:///home/rigel/projects/morphopoiesis.art/site/lib/poiesis/utils/utils.ts
var animate = /* @__PURE__ */ __name((spec, canvas, unis, fpsListener, bufferListener) => {
  let frame = 0;
  let elapsed = 0;
  let idle = 0;
  let start = performance.now();
  let context = null;
  let s = null;
  const rids = { intid: 0, requestId: 0 };
  const crtl = { play: false, delta: 0 };
  const mouse = [0, 0, 0, 0];
  const resolution = [0, 0];
  const aspectRatio = [1, 1];
  const updateMouse = /* @__PURE__ */ __name((x, y) => {
    mouse[2] = mouse[0];
    mouse[3] = mouse[1];
    let rect = canvas.getBoundingClientRect();
    mouse[0] = (x - rect.left) / rect.width;
    mouse[1] = (y - rect.top) / rect.height;
    if (s && s.mouse)
      s.mouse(mouse[0], mouse[1], frame);
  }, "updateMouse");
  canvas.addEventListener("mousemove", (event) => updateMouse(event.clientX, event.clientY));
  canvas.addEventListener("touchmove", (event) => updateMouse(event.touches[0].clientX, event.touches[0].clientY));
  const fps = /* @__PURE__ */ __name(() => {
    fpsListener && fpsListener.onFPS({ fps: (frame / elapsed).toFixed(2), time: elapsed.toFixed(1), frame });
  }, "fps");
  const reset = /* @__PURE__ */ __name(async () => {
    if (context == null)
      context = await PContext.init(canvas);
    frame = 0;
    elapsed = 0;
    idle = 0;
    cancelAnimationFrame(rids.requestId);
    s = spec(canvas.width, canvas.height);
    context = context.build(s);
    if (bufferListener) {
      context = context.addBufferListener(bufferListener);
    }
    rids.requestId = requestAnimationFrame(render);
    start = performance.now();
  }, "reset");
  const canvasResize = /* @__PURE__ */ __name(async (entries) => {
    canvas.width = entries[0].target.clientWidth * devicePixelRatio;
    canvas.height = entries[0].target.clientHeight * devicePixelRatio;
    resolution[0] = canvas.width;
    resolution[1] = canvas.height;
    const factor = resolution[0] < resolution[1] ? resolution[0] : resolution[1];
    aspectRatio[0] = resolution[0] / factor;
    aspectRatio[1] = resolution[1] / factor;
    try {
      await reset();
    } catch (err) {
      console.log(err);
      const error = document.querySelector("#error");
      error.innerHTML = `<span>Sorry, but there was an error with your WebGPU context. <br/> WebGPU is a new standard for graphics on the web.<br/>The standard is currently implemented only <a href='https://caniuse.com/webgpu'>on certain browsers</a>.<br/> For the full experience please use a supported browser. <br/><span style='color:red;'>${err}</span><span/>`;
    }
  }, "canvasResize");
  const observer = new ResizeObserver(canvasResize);
  observer.observe(canvas);
  const render = /* @__PURE__ */ __name(async () => {
    if (crtl.play && !rids.intid) {
      rids.intid = setInterval(() => fps(), 200);
    }
    if (!crtl.play && rids.intid) {
      clearInterval(rids.intid);
      rids.intid = 0;
    }
    if (crtl.play) {
      elapsed = (performance.now() - start) / 1e3 - idle;
      await context.frame(frame, {
        sys: {
          frame,
          time: elapsed,
          mouse,
          resolution,
          aspect: aspectRatio
        },
        ...s.uniforms ? s.uniforms(frame) : {},
        ...unis
      });
      frame++;
    } else
      idle = (performance.now() - start) / 1e3 - elapsed;
    if (crtl.delta != 0)
      setTimeout(() => rids.requestId = requestAnimationFrame(render), crtl.delta);
    else
      rids.requestId = requestAnimationFrame(render);
  }, "render");
  return {
    start: () => {
      crtl.play = true;
    },
    togglePlayPause: () => {
      crtl.play = !crtl.play;
    },
    stop: () => {
      cancelAnimationFrame(rids.requestId);
    },
    reset: () => {
      reset();
    },
    delay: (delta) => {
      crtl.delta = delta;
    }
  };
}, "animate");

// deno:file:///home/rigel/projects/morphopoiesis.art/site/lib/poiesis/poiesis.ts
var PContext = class _PContext {
  static {
    __name(this, "PContext");
  }
  state;
  static async init(canvas) {
    if (!canvas) {
      throw new Error("Canvas is not defined");
    }
    const context = canvas.getContext("webgpu");
    if (!context) {
      throw new Error("WebGPU not supported on this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("No appropriate GPUAdapter found.");
    }
    const device = await adapter.requestDevice();
    context.configure({
      device,
      format: navigator.gpu.getPreferredCanvasFormat()
    });
    return new _PContext({
      context,
      device
    });
  }
  constructor(state) {
    this.state = { ...state };
  }
  build(wgslSpec) {
    const makeBufferView = /* @__PURE__ */ __name((defs, size = 1) => {
      const buffer = defs.isArray ? new ArrayBuffer(defs.arrayStride * size) : new ArrayBuffer(defs.size);
      const ArrayType = /* @__PURE__ */ __name((type) => {
        switch (type) {
          case "f32":
            return Float32Array;
          case "u32":
            return Uint32Array;
          case "i32":
            return Int32Array;
        }
        return Uint8Array;
      }, "ArrayType");
      const makeView = /* @__PURE__ */ __name((def) => {
        if (def.isArray) {
          return Array.from({ length: def.arrayCount }, (e, i) => makeView({
            ...def,
            isArray: false,
            offset: i * def.arrayStride + def.offset,
            // must accumulate offset for arrays in structs
            size: def.size
            // corresponds to the byteSize of the array elements
          }));
        } else if (def.isStruct) {
          return Object.fromEntries(
            Object.entries(def.members).map(
              ([key, value]) => [key, makeView({ ...value, offset: value.offset + def.offset })]
            )
          );
        } else {
          const AT = ArrayType(def.type);
          return new AT(buffer, def.offset, def.size / AT.BYTES_PER_ELEMENT);
        }
      }, "makeView");
      const getViewValue = /* @__PURE__ */ __name((defs2, view2, size2) => {
        if (defs2.isArray) {
          return Array.from({ length: size2 }, (e, i) => getViewValue({ ...defs2, isArray: false }, view2[i], size2));
        } else if (defs2.isStruct) {
          return Object.fromEntries(
            Object.entries(defs2.members).map(
              ([key, value]) => [key, getViewValue(value, view2[key], value.arrayCount)]
            )
          );
        } else {
          return view2.length > 1 ? Array.from(view2) : view2[0];
        }
      }, "getViewValue");
      const setViewValue = /* @__PURE__ */ __name((defs2, view2, size2, data) => {
        if (defs2.isArray) {
          Array.from({ length: size2 }, (e, i) => {
            if (data && data[i])
              setViewValue({ ...defs2, isArray: false }, view2[i], size2, data[i]);
          });
        } else if (defs2.isStruct) {
          Object.entries(defs2.members).map(([key, value]) => {
            if (data[key])
              setViewValue(value, view2[key], value.arrayCount, data[key]);
          });
        } else {
          data && view2.length > 1 ? view2.set(data) : view2.set([data]);
        }
      }, "setViewValue");
      const updateBuffer = /* @__PURE__ */ __name((src) => {
        new Uint8Array(buffer).set(new Uint8Array(src));
      }, "updateBuffer");
      const view = makeView({ ...defs, offset: 0, arrayCount: defs.arrayCount != 0 ? defs.arrayCount : size });
      return {
        name: defs.name,
        buffer,
        set: (data) => setViewValue(defs, view, size, data),
        get: () => getViewValue(defs, view, size),
        update: (buffer2) => updateBuffer(buffer2)
      };
    }, "makeBufferView");
    const createShaderModule = /* @__PURE__ */ __name((spec) => {
      if (!spec.code)
        throw new Error("Code is not defined in spec");
      return this.state.device.createShaderModule({
        label: "Custom shader",
        code: spec.code
      });
    }, "createShaderModule");
    const createGeometry = /* @__PURE__ */ __name((spec) => {
      const buffersLayout = [];
      const makeLayout = /* @__PURE__ */ __name((step, attrs) => {
        const format = /* @__PURE__ */ __name((type, size) => {
          return `${type == "f32" ? "float32" : "u32" ? "uint32" : "int32"}x${size / 4}`;
        }, "format");
        const inputs = spec.defs.entries.vertex.inputs;
        let stride = 0;
        const vattrs = inputs.filter((i) => attrs.includes(i.name)).map((i) => {
          const attr = {
            shaderLocation: i.location,
            offset: stride,
            format: format(i.type, i.size)
          };
          stride += i.size;
          return attr;
        });
        if (vattrs.length == 0)
          throw new Error(`Vertex attributes ${attrs} not found`);
        return {
          arrayStride: stride,
          stepMode: step,
          attributes: vattrs
        };
      }, "makeLayout");
      const vertices = new Float32Array(spec.geometry && spec.geometry.vertex.data || square(1));
      buffersLayout.push(makeLayout("vertex", spec.geometry?.vertex.attributes || ["pos"]));
      const vertexBuffer = this.state.device.createBuffer({
        label: "Geometry vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
      });
      this.state.device.queue.writeBuffer(vertexBuffer, 0, vertices);
      let instancesBuffer = void 0;
      if (spec.geometry && spec.geometry.instance) {
        buffersLayout.push(makeLayout("instance", spec.geometry?.instance.attributes));
        if (spec.geometry.instance.data) {
          const vertices2 = new Float32Array(spec.geometry && spec.geometry.instance.data);
          instancesBuffer = this.state.device.createBuffer({
            label: "Geometry instance",
            size: vertices2.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
          });
          this.state.device.queue.writeBuffer(vertexBuffer, 0, vertices2);
        }
      }
      const instancesCount = spec.geometry && (spec.geometry.vertex.instances || spec.geometry.instance?.instances || 1);
      return {
        vertexBuffer,
        vertexCount: vertices.length / 2,
        // only works for 2d?
        vertexBufferLayout: buffersLayout,
        instances: instancesCount,
        instanceBuffer: instancesBuffer
      };
    }, "createGeometry");
    const createUniforms = /* @__PURE__ */ __name((spec) => {
      const uniforms2 = spec.uniforms ? spec.uniforms(0, [0, 0, 0, 0]) : {};
      const uniRessource = [];
      for (const [key, value] of Object.entries(spec.defs.uniforms)) {
        const uniformDef = value;
        const uniformView = makeBufferView(uniformDef);
        if (uniforms2[key]) {
          uniformView.set(uniforms2[key]);
        }
        const uniformBuffer = this.state.device.createBuffer({
          label: "uniforms",
          size: uniformView.buffer.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.state.device.queue.writeBuffer(uniformBuffer, 0, uniformView.buffer);
        uniRessource.push({
          name: uniformDef.name,
          view: uniformView,
          resource: { buffer: uniformBuffer },
          binding: uniformDef.binding,
          type: "uniform"
        });
      }
      ;
      return uniRessource;
    }, "createUniforms");
    const createStorage = /* @__PURE__ */ __name((spec) => {
      const stateStorage = new Array();
      const readStorage = new Array();
      const vertexStorage = new Array();
      const storage = /* @__PURE__ */ __name((name) => {
        return spec.storages ? spec.storages.find((element) => element.name === name) : void 0;
      }, "storage");
      for (const [key, value] of Object.entries(spec.defs.storages)) {
        const storageDef = value;
        const storageSpec = storage(key);
        if (!storageSpec)
          throw new Error(`Storage spec for ${key} not found`);
        const storageView = makeBufferView(storageDef, storageSpec.size);
        const storageBuffer = this.state.device.createBuffer({
          label: `${storageDef.name} storage buffer`,
          size: storageView.buffer.byteLength,
          // number of bytes to allocate
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | (storageSpec.read ? GPUBufferUsage.COPY_SRC : 0) | (storageSpec.vertex ? GPUBufferUsage.VERTEX : 0)
        });
        if (storageSpec.read) {
          readStorage.push({
            srcBuffer: storageBuffer,
            dstBuffer: this.state.device.createBuffer({
              label: `${storageSpec.name} read buffer`,
              size: storageView.buffer.byteLength,
              usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
            }),
            view: storageView
          });
        }
        if (storageSpec.vertex) {
          vertexStorage.push({ buffer: storageBuffer });
        }
        if (storageSpec.data) {
          storageView.set(storageSpec.data);
        }
        this.state.device.queue.writeBuffer(storageBuffer, 0, storageView.buffer);
        stateStorage.push({
          binding: storageDef.binding,
          resource: { buffer: storageBuffer },
          type: storageDef.access === "read_write" ? "storage" : "read-only-storage"
        });
      }
      return {
        storages: stateStorage,
        readStorages: readStorage,
        vertexStorages: vertexStorage
      };
    }, "createStorage");
    const createSamplers = /* @__PURE__ */ __name((spec) => {
      const samplers2 = spec.defs.samplers.map((sd) => ({
        binding: sd.binding,
        resource: this.state.device.createSampler({
          label: sd.name,
          magFilter: "linear",
          minFilter: "linear"
        }),
        type: "sampler"
      }));
      return samplers2;
    }, "createSamplers");
    const createTextures = /* @__PURE__ */ __name((spec) => {
      const texture = /* @__PURE__ */ __name((image, l) => {
        const texture2 = this.state.device.createTexture({
          label: l,
          size: { width: image.width, height: image.height },
          format: "rgba8unorm",
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.state.device.queue.copyExternalImageToTexture(
          { source: image },
          { texture: texture2 },
          [image.width, image.height]
        );
        return texture2.createView({ format: "rgba8unorm", label: l });
      }, "texture");
      const textures2 = spec.defs.textures.map((td) => {
        const tex = spec.textures ? spec.textures.find((e) => e.name === td.name) : void 0;
        if (!tex)
          throw new Error(`Texture spec for ${td.name} is undefined`);
        if (!tex.data)
          throw new Error(`Texture data for ${td.name} is undefined`);
        const resource = tex.data instanceof HTMLVideoElement ? {
          binding: td.binding,
          resource: this.state.device.importExternalTexture({ label: "external_texture", source: tex.data }),
          type: "external_texture",
          video: tex.data
        } : {
          binding: td.binding,
          resource: texture(tex.data, tex.storage ? "storage_texture" : "texture"),
          type: tex.storage ? "storage_texture" : "texture"
        };
        return resource;
      });
      return textures2;
    }, "createTextures");
    const createBindGroupLayout = /* @__PURE__ */ __name((resources2) => {
      const entries = [];
      resources2.forEach((res) => {
        switch (res.type) {
          case "uniform":
            entries.push({
              binding: res.binding,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
              buffer: { type: res.type }
            });
            break;
            ;
          case "storage":
            entries.push({
              binding: res.binding,
              visibility: GPUShaderStage.COMPUTE,
              buffer: { type: res.type }
            });
            break;
            ;
          case "read-only-storage":
            entries.push({
              binding: res.binding,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
              buffer: { type: res.type }
            });
            break;
            ;
          case "sampler":
            entries.push({
              binding: res.binding,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
              sampler: { type: "filtering" }
            });
            break;
            ;
          case "texture":
            entries.push({
              binding: res.binding,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
              texture: { viewDimension: "2d" }
            });
            break;
            ;
          case "storage_texture":
            entries.push({
              binding: res.binding,
              visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
              storageTexture: { viewDimension: "2d", format: "rgba8unorm" }
            });
            break;
            ;
          case "external_texture":
            entries.push({
              binding: res.binding,
              visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
              externalTexture: { viewDimension: "2d" }
            });
            break;
            ;
        }
      });
      const bindGroupLayout2 = this.state.device.createBindGroupLayout({
        label: "Bind Group Layout",
        entries
      });
      return bindGroupLayout2;
    }, "createBindGroupLayout");
    const createBindings = /* @__PURE__ */ __name((spec, resources2, bindGroupLayout2) => {
      const resbinding = new Array(spec.defs.bindGroupLength);
      resources2.forEach((res) => {
        resbinding[res.binding] = res;
      });
      const bindingsCount = resources2.length;
      const bindingGroupsCount = spec.bindings?.length || 1;
      const bindingGroups = new Array(bindingGroupsCount);
      const externals = Array(bindingGroupsCount);
      const entries = Array(bindingGroupsCount);
      for (let i = 0; i < bindingGroupsCount; i++) {
        entries[i] = [];
        for (let j = 0; j < bindingsCount; j++) {
          const index = spec.bindings ? spec.bindings[i][j] : j;
          if (index == void 0)
            throw new Error(`Binding ${j} was not found in group ${i}. Check your bindings spec.`);
          const res = resbinding[index];
          if (!res)
            throw new Error(`Binding ${index} defined in group ${i} not found`);
          entries[i].push({
            // we need to use the first group to define the bindings reference
            // we want to keep the binding order but change the resources order
            binding: spec.bindings ? spec.bindings[0][j] : j,
            resource: res.resource
          });
          if (res.type === "external_texture") {
            externals[i] = { idx: j, video: res.video };
          }
          ;
        }
        bindingGroups[i] = this.state.device.createBindGroup({
          label: `Bind Group ${i}`,
          layout: bindGroupLayout2,
          entries: entries[i]
        });
      }
      return (index) => {
        if (externals[index]) {
          const { idx, video } = externals[index];
          entries[index][idx].resource = this.state.device.importExternalTexture({ source: video });
          return this.state.device.createBindGroup({
            label: `Bind Group ${index}`,
            layout: bindGroupLayout2,
            entries: entries[index]
          });
        }
        return bindingGroups[index];
      };
    }, "createBindings");
    const createPipelineLayout = /* @__PURE__ */ __name((bindGroupLayout2) => {
      return this.state.device.createPipelineLayout({
        label: "Pipeline Layout",
        bindGroupLayouts: [bindGroupLayout2]
      });
    }, "createPipelineLayout");
    const createComputePipelines = /* @__PURE__ */ __name((shaderModule2, pipelineLayout2, spec) => {
      const pipelines = [];
      const computeGC = /* @__PURE__ */ __name((spec2) => {
        const gc = spec2.bindings ? spec2.bindings.length : 1;
        const cgc = spec2.computeGroupCount ? spec2.computeGroupCount : 1;
        return cgc > 1 ? cgc + (gc - (cgc - 2) % gc - 1) : 1;
      }, "computeGC");
      const compute = /* @__PURE__ */ __name((name) => spec.computes ? spec.computes.find((e) => e.name === name) : void 0, "compute");
      for (let i = 0; i < spec.defs.entries.computes.length; i++) {
        const entryPoint = spec.defs.entries.computes[i].name;
        const c = compute(entryPoint);
        if (!c)
          throw new Error(`Spec for compute ${entryPoint} not found!`);
        const pipeline = this.state.device.createComputePipeline({
          label: `${entryPoint} compute pipeline`,
          layout: pipelineLayout2,
          compute: {
            module: shaderModule2,
            entryPoint
          }
        });
        pipelines.push({
          pipeline,
          workgroups: c.workgroups || [1, 1, 1],
          instances: c.instances || 1
        });
      }
      return {
        computeGroup: pipelines,
        computeGroupCount: computeGC(spec)
      };
    }, "createComputePipelines");
    const createRenderPipeline = /* @__PURE__ */ __name((shaderModule2, pipelineLayout2, spec) => {
      if (!spec.defs.entries.vertex || !spec.defs.entries.fragment)
        return void 0;
      const vertexEntryPoint = spec.defs.entries.vertex.name;
      const fragmentEntryPoint = spec.defs.entries.fragment.name;
      return this.state.device.createRenderPipeline({
        label: "Render pipeline",
        layout: pipelineLayout2,
        vertex: {
          module: shaderModule2,
          entryPoint: vertexEntryPoint,
          buffers: geometry.vertexBufferLayout
        },
        fragment: {
          module: shaderModule2,
          entryPoint: fragmentEntryPoint,
          targets: [{
            format: navigator.gpu.getPreferredCanvasFormat()
          }]
        }
      });
    }, "createRenderPipeline");
    const shaderModule = createShaderModule(wgslSpec);
    const geometry = createGeometry(wgslSpec);
    const uniforms = createUniforms(wgslSpec);
    const storages = createStorage(wgslSpec);
    const samplers = createSamplers(wgslSpec);
    const textures = createTextures(wgslSpec);
    const resources = [...uniforms, ...storages.storages, ...samplers, ...textures];
    const bindGroupLayout = createBindGroupLayout(resources);
    const pipelineLayout = createPipelineLayout(bindGroupLayout);
    const bindings = createBindings(wgslSpec, resources, bindGroupLayout);
    const renderPipeline = createRenderPipeline(shaderModule, pipelineLayout, wgslSpec);
    const computePipelines = createComputePipelines(shaderModule, pipelineLayout, wgslSpec);
    return new _PContext({
      ...this.state,
      geometry,
      uniforms,
      storages,
      pipelines: {
        render: renderPipeline,
        compute: computePipelines,
        bindings
      },
      clearColor: wgslSpec.clearColor || { r: 0, g: 0, b: 0, a: 1 },
      wgslSpec
    });
  }
  addBufferListener(listener) {
    return new _PContext({
      ...this.state,
      bufferListeners: [listener]
    });
  }
  async frame(frame = 0, unis) {
    const { bufferListeners, storages, device, uniforms, pipelines, geometry, context, clearColor, wgslSpec } = this.state;
    const bindGroup = /* @__PURE__ */ __name((i) => wgslSpec.bindings ? i % wgslSpec.bindings.length : 0, "bindGroup");
    const setUniforms = /* @__PURE__ */ __name((unis2) => {
      uniforms?.forEach((uniform) => {
        if (unis2[uniform.name]) {
          uniform.view.set(unis2[uniform.name]);
          device.queue.writeBuffer(uniform.resource.buffer, 0, uniform.view.buffer);
        }
      });
    }, "setUniforms");
    const submitCommands = /* @__PURE__ */ __name(() => {
      const encoder = device.createCommandEncoder();
      if (pipelines?.compute) {
        const computePass = encoder.beginComputePass();
        for (let cg = 0; cg < pipelines.compute.computeGroupCount; cg++) {
          const bg = bindGroup(frame + cg);
          for (let c = 0; c < pipelines.compute.computeGroup.length; c++) {
            const compute = pipelines.compute.computeGroup[c];
            computePass.setPipeline(compute.pipeline);
            for (let i = 0; i < compute.instances; i++) {
              const g = bindGroup(bg + i);
              computePass.setBindGroup(0, pipelines.bindings(g));
              computePass.dispatchWorkgroups(...compute.workgroups);
            }
          }
        }
        computePass.end();
      }
      if (pipelines?.render) {
        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: clearColor,
            storeOp: "store"
          }]
        });
        pass.setPipeline(pipelines.render);
        if (geometry?.vertexBuffer)
          pass.setVertexBuffer(0, geometry.vertexBuffer);
        if (storages && storages.vertexStorages.length > 0) {
          pass.setVertexBuffer(1, storages.vertexStorages[bindGroup(frame)].buffer);
        } else if (geometry?.instanceBuffer) {
          pass.setVertexBuffer(1, geometry.instanceBuffer);
        }
        pass.setBindGroup(0, pipelines.bindings(bindGroup(frame)));
        if (geometry)
          pass.draw(geometry.vertexCount, geometry.instances || 1);
        pass.end();
      }
      if (storages && storages.readStorages.length > 0) {
        storages.readStorages.forEach((storage) => {
          encoder.copyBufferToBuffer(storage.srcBuffer, 0, storage.dstBuffer, 0, storage.view.buffer.byteLength);
        });
      }
      device.queue.submit([encoder.finish()]);
    }, "submitCommands");
    const readBuffers = /* @__PURE__ */ __name(async () => {
      if (bufferListeners) {
        const buffers = storages?.readStorages || [];
        if (buffers.length == 0)
          return;
        await Promise.all(buffers.map((buff) => buff.dstBuffer.mapAsync(GPUMapMode.READ)));
        bufferListeners.forEach((listener) => {
          const data = buffers.map((s) => {
            s.view.update(s.dstBuffer.getMappedRange());
            return s.view;
          });
          listener.onRead(data);
          buffers.forEach((s) => s.dstBuffer.unmap());
        });
      }
    }, "readBuffers");
    setUniforms(unis);
    submitCommands();
    await readBuffers();
  }
};

// deno:file:///home/rigel/projects/morphopoiesis.art/site//shaders/draft/video360/video360.ts
var video360 = /* @__PURE__ */ __name(async (code, defs) => {
  const video = document.createElement("video");
  video.src = "/assets/video/redsea.mp4";
  video.loop = true;
  video.muted = true;
  await video.play();
  video.pause();
  document.addEventListener("click", () => {
    video.muted = false;
    video.paused ? video.play() : video.pause();
  });
  const spec = /* @__PURE__ */ __name((w, h) => {
    return {
      code,
      defs,
      uniforms: () => ({ params: { fov: 90 } }),
      textures: [
        { name: "video360", data: video }
      ]
    };
  }, "spec");
  return spec;
}, "video360");

// deno:file:///home/rigel/projects/morphopoiesis.art/site/shaders/shaders[4].page.ts
document.addEventListener("DOMContentLoaded", async (event) => {
  const canvas = document.querySelector("#canvas");
  document.addEventListener("keypress", function(event2) {
    if (event2.key === "s") {
      let dataUrl = canvas.toDataURL("image/png");
      let link = document.createElement("a");
      link.href = dataUrl;
      link.download = "video360.png";
      link.click();
    }
  });
  const fx = "$fx" in window ? $fx : void 0;
  const code = await (await fetch("./video360.wgsl")).text();
  const defs = await (await fetch("./video360.json")).json();
  const spec = await video360(code, defs, fx);
  false;
  false;
  false;
  const anim = animate(spec, canvas, {});
  anim.start();
});
