import{a as e,c as t,d as n,i as r,o as i,t as a}from"./index-CpfOt9Jl.js";import{C as o,E as s,O as c,T as l,a as u,d,g as f,h as p,i as m,m as h,n as g,o as _,p as v,r as y,s as b,t as x,u as S,v as C}from"./Lightformer-pmuF8JOz.js";function w(e,t,n,r){var i=class extends o{constructor(i){super({vertexShader:t,fragmentShader:n,...i});for(let t in e)this.uniforms[t]=new l(e[t]),Object.defineProperty(this,t,{get(){return this.uniforms[t].value},set(e){this.uniforms[t].value=e}});this.uniforms=s.clone(this.uniforms),r?.(this)}};return i.key=f.generateUUID(),i}var T=n(t());function E(e,t,n){let r=b(e=>e.size),i=b(e=>e.viewport),a=typeof e==`number`?e:r.width*i.dpr,o=typeof t==`number`?t:r.height*i.dpr,s=(typeof e==`number`?n:e)||{},{samples:l=0,depth:u,...f}=s,m=u??s.depthBuffer,g=T.useMemo(()=>{let e=new c(a,o,{minFilter:p,magFilter:p,type:h,...f});return m&&(e.depthTexture=new d(a,o,v)),e.samples=l,e},[]);return T.useLayoutEffect(()=>{g.setSize(a,o),l&&(g.samples=l)},[l,g,a,o]),T.useEffect(()=>()=>g.dispose(),[]),g}var D=w({},`void main() { }`,`void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); discard;  }`),O=class extends C{constructor(e=6,t=!1){super(),this.uniforms={chromaticAberration:{value:.05},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},roughness:{value:0},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:1/0},attenuationColor:{value:new S(`white`)},anisotropicBlur:{value:.1},time:{value:0},distortion:{value:0},distortionScale:{value:.5},temporalDistortion:{value:0},buffer:{value:null}},this.onBeforeCompile=n=>{n.uniforms={...n.uniforms,...this.uniforms},(this.anisotropy??0)>0&&(n.defines.USE_ANISOTROPY=``),t?n.defines.USE_SAMPLER=``:n.defines.USE_TRANSMISSION=``,n.fragmentShader=`
      uniform float chromaticAberration;         
      uniform float anisotropicBlur;      
      uniform float time;
      uniform float distortion;
      uniform float distortionScale;
      uniform float temporalDistortion;
      uniform sampler2D buffer;

      vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
      }

      uint hash( uint x ) {
        x += ( x << 10u );
        x ^= ( x >>  6u );
        x += ( x <<  3u );
        x ^= ( x >> 11u );
        x += ( x << 15u );
        return x;
      }

      // Compound versions of the hashing algorithm I whipped together.
      uint hash( uvec2 v ) { return hash( v.x ^ hash(v.y)                         ); }
      uint hash( uvec3 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z)             ); }
      uint hash( uvec4 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w) ); }

      // Construct a float with half-open range [0:1] using low 23 bits.
      // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
      float floatConstruct( uint m ) {
        const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
        const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32
        m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
        m |= ieeeOne;                          // Add fractional part to 1.0
        float  f = uintBitsToFloat( m );       // Range [1:2]
        return f - 1.0;                        // Range [0:1]
      }

      // Pseudo-random value in half-open range [0:1].
      float randomBase( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }
      float randomBase( vec2  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec3  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float randomBase( vec4  v ) { return floatConstruct(hash(floatBitsToUint(v))); }
      float rand(float seed) {
        float result = randomBase(vec3(gl_FragCoord.xy, seed));
        return result;
      }

      const float F3 =  0.3333333;
      const float G3 =  0.1666667;

      float snoise(vec3 p) {
        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));
        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);
        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;
        vec4 w, d;
        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);
        w = max(0.6 - w, 0.0);
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
        w *= w;
        w *= w;
        d *= w;
        return dot(d, vec4(52.0));
      }

      float snoiseFractal(vec3 m) {
        return 0.5333333* snoise(m)
              +0.2666667* snoise(2.0*m)
              +0.1333333* snoise(4.0*m)
              +0.0666667* snoise(8.0*m);
      }
`+n.fragmentShader,n.fragmentShader=n.fragmentShader.replace(`#include <transmission_pars_fragment>`,`
        #ifdef USE_TRANSMISSION
          // Transmission code is based on glTF-Sampler-Viewer
          // https://github.com/KhronosGroup/glTF-Sample-Viewer
          uniform float _transmission;
          uniform float thickness;
          uniform float attenuationDistance;
          uniform vec3 attenuationColor;
          #ifdef USE_TRANSMISSIONMAP
            uniform sampler2D transmissionMap;
          #endif
          #ifdef USE_THICKNESSMAP
            uniform sampler2D thicknessMap;
          #endif
          uniform vec2 transmissionSamplerSize;
          uniform sampler2D transmissionSamplerMap;
          uniform mat4 modelMatrix;
          uniform mat4 projectionMatrix;
          varying vec3 vWorldPosition;
          vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in vec3 modelScale ) {
            // Direction of refracted light.
            // n is normalized once when the sample normal is built.
            vec3 refractionVector = refract( - v, n, 1.0 / ior );
            // The thickness is specified in local space.
            return normalize( refractionVector ) * thickness * modelScale;
          }
          float applyIorToRoughness( const in float roughness, const in float ior ) {
            // Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
            // an IOR of 1.5 results in the default amount of microfacet refraction.
            return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
          }
          vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
            float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );            
            #ifdef USE_SAMPLER
              #ifdef texture2DLodEXT
                return texture2DLodEXT(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #else
                return texture2D(transmissionSamplerMap, fragCoord.xy, framebufferLod);
              #endif
            #else
              return texture2D(buffer, fragCoord.xy);
            #endif
          }
          vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
            const in vec3 position, const in vec3 modelScale, const in vec3 attenuationCoefficient, const in vec3 F,
            const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
            const in float attenuationDistance ) {
            vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelScale );
            vec3 refractedRayExit = position + transmissionRay;
            // Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
            vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
            vec2 refractionCoords = ndcPos.xy / ndcPos.w;
            refractionCoords += 1.0;
            refractionCoords /= 2.0;
            // Sample framebuffer to get pixel the refracted ray hits.
            vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
            vec3 attenuatedColor = transmittedLight.rgb;
            if ( !isinf( attenuationDistance ) ) {
              // Apply Beer's law.
              attenuatedColor *= exp( - attenuationCoefficient * length( transmissionRay ) );
            }
            return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
          }
        #endif
`),n.fragmentShader=n.fragmentShader.replace(`#include <transmission_fragment>`,`  
        // Improve the refraction to use the world pos
        material.transmission = _transmission;
        material.transmissionAlpha = 1.0;
        material.thickness = thickness;
        material.attenuationDistance = attenuationDistance;
        material.attenuationColor = attenuationColor;
        #ifdef USE_TRANSMISSIONMAP
          material.transmission *= texture2D( transmissionMap, vUv ).r;
        #endif
        #ifdef USE_THICKNESSMAP
          material.thickness *= texture2D( thicknessMap, vUv ).g;
        #endif
        
        if (material.transmission != 0.0) {
          vec3 pos = vWorldPosition;
          float runningSeed = 0.0;
          vec3 v = normalize( cameraPosition - pos );
          vec3 n = inverseTransformDirection( normal, viewMatrix );
          vec3 transmission = vec3(0.0);
          float randomCoords = rand(runningSeed++);
          float thickness_smear = thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);
          vec3 distortionNormal = vec3(0.0);
          vec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;

          vec3 modelScale = vec3(
            length( vec3( modelMatrix[ 0 ].xyz ) ),
            length( vec3( modelMatrix[ 1 ].xyz ) ),
            length( vec3( modelMatrix[ 2 ].xyz ) )
          );

          // Beer's-law coefficient
          vec3 attenuationCoefficient = vec3(0.0);
          if ( !isinf( material.attenuationDistance ) ) {
            attenuationCoefficient = -log( material.attenuationColor ) / material.attenuationDistance;
          }

          if (distortion > 0.0) {
            distortionNormal = distortion * vec3(snoiseFractal(vec3((pos * distortionScale + temporalOffset))), snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)), snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset)));
          }
          for (float i = 0.0; i < ${e}.0; i ++) {
            vec3 sampleNorm;
            if (roughnessFactor > 0.0) {
              sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5, rand(runningSeed++) - 0.5)) * pow(rand(runningSeed++), 0.33) + distortionNormal);
            } else {
              // Smooth surfaces skip four hashes, a pow, and a normalization per sample
              sampleNorm = normalize(n + distortionNormal);
            }
            float sampleProgress = (i + randomCoords) / float(${e});
            float sampleThickness = material.thickness + thickness_smear * sampleProgress;
            // Fresnel is identical for RGB; only the refracted IOR changes.
            vec3 F = EnvironmentBRDF( sampleNorm, v, material.specularColor, material.specularF90, material.roughness );
            if (chromaticAberration == 0.0) {
              // With one IOR, a single framebuffer sample supplies all RGB channels
              transmission += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior, sampleThickness, material.attenuationDistance
              ).rgb;
            } else {
              float aberration = chromaticAberration * sampleProgress;
              transmission.r += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior, sampleThickness, material.attenuationDistance
              ).r;
              transmission.g += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior * (1.0 + aberration), sampleThickness, material.attenuationDistance
              ).g;
              transmission.b += getIBLVolumeRefraction(
                sampleNorm, v, material.roughness, material.diffuseColor, pos, modelScale, attenuationCoefficient, F,
                viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * aberration), sampleThickness, material.attenuationDistance
              ).b;
            }
          }
          transmission /= ${e}.0;
          totalDiffuse = mix( totalDiffuse, transmission, material.transmission );
        }\n`)},Object.keys(this.uniforms).forEach(e=>Object.defineProperty(this,e,{get:()=>this.uniforms[e].value,set:t=>this.uniforms[e].value=t}))}},k=T.forwardRef(({buffer:e,transmissionSampler:t=!1,backside:n=!1,side:r=0,transmission:i=1,thickness:a=0,backsideThickness:o=0,backsideEnvMapIntensity:s=1,samples:c=10,resolution:l,backsideResolution:d,background:f,anisotropy:p,anisotropicBlur:m,...h},g)=>{u({MeshTransmissionMaterial:O});let v=T.useRef(null),[b]=T.useState(()=>new D),x=d??l,S=E(x,x),C=E(l,l),w,k,A,j;return _(e=>{let i=v.current;if(i.uniforms.time.value=e.clock.elapsedTime,i.uniforms.buffer.value===C.texture&&!t){var c;j=(c=i.__r3f)==null||(c=c.parent)==null?void 0:c.object,j&&i.visible&&i.uniforms._transmission.value!==0&&(A=e.gl.toneMapping,w=e.scene.background,k=i.envMapIntensity,e.gl.toneMapping=0,f&&(e.scene.background=f),j.material=b,n&&(e.gl.setRenderTarget(S),e.gl.render(e.scene,e.camera),j.material=i,i.uniforms.buffer.value=S.texture,i.uniforms.thickness.value=o,i.side=1,r!==1&&(i.needsUpdate=!0),i.envMapIntensity=s),e.gl.setRenderTarget(C),e.gl.render(e.scene,e.camera),j.material=i,i.uniforms.thickness.value=a,i.side=r,n&&r!==1&&(i.needsUpdate=!0),i.uniforms.buffer.value=C.texture,i.envMapIntensity=k,e.scene.background=w,e.gl.setRenderTarget(null),e.gl.toneMapping=A)}}),T.useImperativeHandle(g,()=>v.current,[]),T.createElement(`meshTransmissionMaterial`,y({args:[c,t],ref:v},h,{buffer:e||C.texture,_transmission:i,anisotropicBlur:m??p,transmission:t?i:0,thickness:a,side:r}))}),A=r(),j={default:{primary:`#38BDF8`,secondary:`#6366F1`,attenuation:`#1e3a5f`,glass:`#b8dcff`},0:{primary:`#10B981`,secondary:`#38BDF8`,attenuation:`#064e3b`,glass:`#a7f3d0`},1:{primary:`#8B5CF6`,secondary:`#6366F1`,attenuation:`#3b1d7a`,glass:`#ddd6fe`},2:{primary:`#38BDF8`,secondary:`#00F0FF`,attenuation:`#0c4a6e`,glass:`#bae6fd`},3:{primary:`#F59E0B`,secondary:`#00F0FF`,attenuation:`#6b3408`,glass:`#fde68a`}},M=class extends T.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}componentDidCatch(){}render(){return this.state.failed?null:this.props.children}};function N({activePillar:e,reducedMotion:t}){let n=(0,T.useRef)(null),r=(0,T.useRef)(null),i=(0,T.useRef)(null),o=(0,T.useRef)(null),s=(0,T.useRef)(null),c=(0,T.useRef)(null),l=(0,T.useRef)(null),u=(0,T.useRef)(null),d=(0,T.useRef)(null),p=(0,T.useRef)(null),m=(0,T.useRef)(null),h=(0,T.useMemo)(()=>new S,[]),v=(0,T.useMemo)(()=>new S,[]),y=(0,T.useMemo)(()=>new S,[]),b=(0,T.useMemo)(()=>new S,[]),C=(0,T.useMemo)(()=>new S(j.default.primary),[]),w=(0,T.useMemo)(()=>new S(j.default.secondary),[]),E=(0,T.useMemo)(()=>new S(j.default.attenuation),[]),D=(0,T.useMemo)(()=>new S(j.default.glass),[]),O=(0,T.useMemo)(()=>[0,Math.PI/2,Math.PI,3*Math.PI/2],[]);return _((g,_)=>{let x=Math.min(_,.05),S=t?0:g.clock.elapsedTime,T=f.damp,O=e===null?j.default:j[e];h.set(O.primary),v.set(O.secondary),y.set(O.attenuation),b.set(O.glass);let k=1-Math.exp(-4.5*x);C.lerp(h,k),w.lerp(v,k),E.lerp(y,k),D.lerp(b,k),u.current&&(u.current.color.copy(C),u.current.intensity=T(u.current.intensity,e===null?16:24,4,x)),d.current&&(d.current.color.copy(w),d.current.intensity=T(d.current.intensity,e===null?13:18,4,x)),p.current&&(p.current.color.copy(C),p.current.intensity=T(p.current.intensity,e===null?8:14,4,x)),c.current&&(c.current.emissive.copy(C),c.current.color.copy(D),c.current.emissiveIntensity=T(c.current.emissiveIntensity,e===null?1.35:2.4,4,x)),l.current&&l.current.emissive.copy(w),m.current&&(m.current.color&&m.current.color.copy(D),m.current.attenuationColor&&m.current.attenuationColor.copy(E));let A=a.pointerActive?a.mx:0,M=a.pointerActive?a.my:0;if(n.current&&(n.current.position.y=Math.sin(S*.55)*.08,n.current.rotation.x=T(n.current.rotation.x,.24-M*.28+Math.cos(S*.32)*.06,2.4,x),n.current.rotation.y=T(n.current.rotation.y,-.32+A*.38+Math.sin(S*.28)*.08,2.2,x)),r.current&&(r.current.rotation.z=S*.14,r.current.rotation.x=Math.sin(S*.22)*.18),i.current&&(i.current.rotation.y=-S*.22,i.current.rotation.x=Math.PI/2.6+Math.cos(S*.3)*.15),o.current&&(o.current.rotation.x=S*.19+M*.15,o.current.rotation.y=S*.26+A*.18,o.current.rotation.z=Math.sin(S*.18)*.12),s.current){s.current.rotation.y=-S*.48,s.current.rotation.z=S*.32;let t=1+Math.sin(S*1.8)*.035+(e===null?0:.06);s.current.scale.setScalar(T(s.current.scale.x,t,4,x))}}),(0,A.jsxs)(A.Fragment,{children:[(0,A.jsxs)(g,{resolution:256,frames:1,children:[(0,A.jsx)(x,{form:`rect`,intensity:4.2,color:`#ffffff`,position:[0,5,3],scale:[8,2,1],"rotation-x":Math.PI/2}),(0,A.jsx)(x,{form:`rect`,intensity:3.8,color:`#38BDF8`,position:[-5,1.5,2],scale:[5,2.5,1],"rotation-y":Math.PI/2}),(0,A.jsx)(x,{form:`rect`,intensity:3.4,color:`#6366F1`,position:[5,-1,2],scale:[5,2.5,1],"rotation-y":-Math.PI/2}),(0,A.jsx)(x,{form:`ring`,intensity:2.6,color:`#10B981`,position:[0,-4,3],scale:4.5,"rotation-x":-Math.PI/2})]}),(0,A.jsx)(`ambientLight`,{color:`#090d1a`,intensity:.55}),(0,A.jsx)(`directionalLight`,{color:`#f8fafc`,intensity:1.8,position:[4,6,5]}),(0,A.jsx)(`pointLight`,{ref:u,color:`#38BDF8`,intensity:16,distance:9,decay:2,position:[-2.6,2.2,2.8]}),(0,A.jsx)(`pointLight`,{ref:d,color:`#6366F1`,intensity:13,distance:9,decay:2,position:[2.8,-1.8,2.4]}),(0,A.jsx)(`pointLight`,{color:`#10B981`,intensity:9,distance:8,decay:2,position:[0,2.8,-2.5]}),(0,A.jsxs)(`group`,{ref:n,scale:.96,children:[(0,A.jsxs)(`group`,{ref:r,children:[(0,A.jsxs)(`mesh`,{children:[(0,A.jsx)(`torusGeometry`,{args:[1.92,.052,48,200]}),(0,A.jsx)(`meshPhysicalMaterial`,{color:`#0e1422`,metalness:.92,roughness:.18,clearcoat:.95,clearcoatRoughness:.12})]}),(0,A.jsxs)(`mesh`,{children:[(0,A.jsx)(`torusGeometry`,{args:[1.84,.014,24,160]}),(0,A.jsx)(`meshStandardMaterial`,{color:`#38bdf8`,metalness:.95,roughness:.15,emissive:`#0c4a6e`,emissiveIntensity:.6})]}),O.map(e=>(0,A.jsxs)(`mesh`,{position:[Math.cos(e)*1.92,Math.sin(e)*1.92,0],rotation:[0,0,e],children:[(0,A.jsx)(`cylinderGeometry`,{args:[.072,.072,.14,24]}),(0,A.jsx)(`meshPhysicalMaterial`,{color:`#1e293b`,metalness:.95,roughness:.16,clearcoat:1})]},e))]}),(0,A.jsx)(`group`,{ref:i,children:(0,A.jsxs)(`mesh`,{children:[(0,A.jsx)(`torusGeometry`,{args:[1.58,.028,36,180]}),(0,A.jsx)(`meshPhysicalMaterial`,{color:`#141c2e`,metalness:.9,roughness:.2,clearcoat:.9,clearcoatRoughness:.15})]})}),(0,A.jsxs)(`mesh`,{ref:o,children:[(0,A.jsx)(`torusKnotGeometry`,{args:[.88,.23,220,48,2,3]}),(0,A.jsx)(k,{ref:m,backside:!0,samples:4,resolution:256,transmission:.95,thickness:1.5,roughness:.12,chromaticAberration:.06,anisotropy:.3,distortion:.15,distortionScale:.25,temporalDistortion:.08,ior:1.52,clearcoat:1,clearcoatRoughness:.08,attenuationDistance:2.2,attenuationColor:`#1e3a5f`,color:`#b8dcff`})]}),(0,A.jsxs)(`group`,{ref:s,children:[(0,A.jsx)(`pointLight`,{ref:p,color:`#38BDF8`,intensity:8,distance:4.5,decay:2}),(0,A.jsxs)(`mesh`,{children:[(0,A.jsx)(`octahedronGeometry`,{args:[.34,0]}),(0,A.jsx)(`meshPhysicalMaterial`,{ref:c,color:`#b8dcff`,emissive:`#38BDF8`,emissiveIntensity:1.35,metalness:.25,roughness:.08,clearcoat:1,clearcoatRoughness:.04})]}),(0,A.jsxs)(`mesh`,{rotation:[Math.PI/4,Math.PI/4,0],children:[(0,A.jsx)(`icosahedronGeometry`,{args:[.46,0]}),(0,A.jsx)(`meshStandardMaterial`,{ref:l,color:`#1e293b`,emissive:`#6366F1`,emissiveIntensity:.45,metalness:.92,roughness:.18,wireframe:!0})]})]})]})]})}function P({activePillar:t}){let n=e(),r=i(),a=(0,T.useRef)(null),[o,s]=(0,T.useState)(!0);return(0,T.useEffect)(()=>{let e=a.current;if(!e)return;let t=new IntersectionObserver(e=>{for(let t of e)s(t.isIntersecting)},{threshold:.01});return t.observe(e),()=>t.disconnect()},[]),(0,A.jsx)(`div`,{ref:a,className:`hero-sculpture-stage`,"aria-hidden":`true`,children:(0,A.jsx)(M,{children:(0,A.jsx)(m,{frameloop:o?`always`:`never`,dpr:[1,n?1.5:2],camera:{position:[0,0,5.4],fov:40,near:.1,far:30},gl:{antialias:!0,alpha:!0,powerPreference:`high-performance`,toneMapping:4,toneMappingExposure:1.08},children:(0,A.jsx)(N,{activePillar:t,reducedMotion:r})})})})}export{P as default};