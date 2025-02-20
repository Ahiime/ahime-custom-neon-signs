/**
 * Adds 2d/3d objects on the canvas.
 * This library was designed to build a 3D product configurator. It was initiated and built by the Ahime team.
 * It is available on the website https://ahime.net.
 * @class ACTNS_NEON
 * @since 1.0.0
 * @link https://ahime.net
 * @author Nahim SALAMI
 * @memberof Ahime
 * @mail nahim.salami@ahime.net, nahim.salami@outlook.fr, marcjeoge@gmail.com
 */

const OrbitControls = THREE.OrbitControls;
const OBJLoader = THREE.OBJLoader;
const FontLoader = THREE.FontLoader;
const TextGeometry = THREE.TextGeometry
const RoundedBoxGeometry = THREE.RoundedBoxGeometry;
const EffectComposer = THREE.EffectComposer;
const RenderPass = THREE.RenderPass;
const UnrealBloomPass = THREE.UnrealBloomPass;
const ShaderPass = THREE.ShaderPass;
const CopyShader = THREE.CopyShader;
const MTLLoader = THREE.MTLLoader;
const FBXLoader = THREE.FBXLoader;
const GLTFLoader = THREE.GLTFLoader;

var ACTNS_NEON = (function () {
    var scene,
        camera,
        controls,
        renderer,
        composer,
        currentObj = [],
        canvasSelector;

    function ACTNS_NEON(selector) {
        this.set("selector", selector);
        canvasSelector = document.querySelector(selector);
        this.init();
    }

    /**
     * Initializes the basic functionality.
     */
    ACTNS_NEON.prototype.init = function () {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        scene = new THREE.Scene();
        // scene.background = new THREE.Color("#010e1c"); // #010e1c
        camera = new THREE.PerspectiveCamera(75, canvasSelector.offsetWidth / canvasSelector.offsetHeight, 0.1, 100);
        camera.position.x = 1
        camera.position.y = 2
        camera.position.z = 5
        renderer.setSize(canvasSelector.offsetWidth, canvasSelector.offsetHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor('#262837')

        // Shadows
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        canvasSelector.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.minPolarAngle = 0; // radians
        controls.maxPolarAngle = Math.PI / 2 - 0.1; // radians
        controls.minAzimuthAngle = - Infinity; // radians
        controls.maxAzimuthAngle = Infinity; // radians

        controls.minDistance = 3;
        controls.maxDistance = 17;

        controls.update();
      

        controls.addEventListener('change', () => { this.render() });
        this.set("scene", scene);
        this.set("camera", camera);
        this.set("controls", controls);
        this.set("renderer", renderer);
        // this.addLight();
        // this.addScene();
        // this.addGlowEffect(2);

    }

    ACTNS_NEON.prototype.addScene = function () {
        // Paramètres du cercle
        const radius = 14;
        const segments = 68;

        const textureLoader = new THREE.TextureLoader();

        var pathTexture = '../assets/scene/bois.jpg';

        const that = this;

        textureLoader.load(pathTexture, function (texture) {
            // Création d'un cercle
            const geometry = new THREE.CircleGeometry(radius, segments);
            const material = new THREE.MeshBasicMaterial({
                // color: new THREE.Color("#10ff00"), 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7,
                map: texture
            });

            material.map.repeat.set(7, 1);
            material.map.wrapS = THREE.RepeatWrapping;
            const plane = new THREE.Mesh(geometry, material);

            plane.castShadow = true; // L'objet émet des ombres
            plane.receiveShadow = true; // L'objet reçoit des ombres
            plane.rotation.x = -Math.PI / 2; // Mettre à plat
            plane.position.y = -1;
            scene.add(plane);

            that.render();
        })


    }


    /**
    * Illuminates the scene with ambient color.
    */
    ACTNS_NEON.prototype.addLight = function () {
        var light = new THREE.AmbientLight(0xffffff, .05);
        scene.add(light);


        this.render();
    }

    ACTNS_NEON.prototype.addNeonTextFormOne = function (
        text = "Hello",
        color = "#eeefff",
        lightColor = "#eeefff",
        intensity = 2.5,
        fontPath = '',
        animate = false,
        position = { x: 0, y: 0, z: 0 }
    ) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        let font = new FontLoader().parse(fontPath)

        var textGeometry = new TextGeometry(text, {
            font: font,
            size: 3,
            depth: .05,
            curveSegments: 25,
            bevelSize: .005,
            bevelOffset: .001,
            bevelThickness: .005,
            bevelEnabled: true
        });

        const textMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            metalness: 1,
            roughness: 0.5,
            emissiveIntensity: animate ? 0 : 1, // Commence avec une lumière éteinte si l'animation est activé
            emissive: new THREE.Color(lightColor)
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        // scene.add(textMesh);
        currentObj.push(textMesh);
        textMesh.position.set(position.x, position.y, position.z);

        let house = this.createHouse();

        textMesh.position.set(-.8, 2.2, 2)

        house.add(textMesh);
        // adaptOnView(textMesh);
        that.render(true);

        if (animate) {
            // Animation de la lumière en boucle
            that.animateNeonEffect(textMesh.material, intensity);

            that.render(true);
        }
    };


    ACTNS_NEON.prototype.animateNeonEffect = function (material, intensity) {
        gsap.to(material, {
            emissiveIntensity: intensity,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "elastic.out",
            stagger: .2,
        });
    }

    ACTNS_NEON.prototype.addNeonTextFormTwo = function (
        text = "Hello",
        color = "#eeefff",
        lightColor = "#eeefff",
        intensity = 4,
        fontPath = '',
        animate = false,
        boardColor = 'red',
        position = { x: 0, y: 0, z: 0 }) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        let font = new FontLoader().parse(fontPath);

        var middlePanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            depth: .005,
            curveSegments: 20,
            bevelSize: .0005,
            bevelOffset: .001,
            bevelThickness: .005,
            bevelEnabled: true
        });

        const middlePanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color(color),
                metalness: 1,
                roughness: 0.5,
                emissiveIntensity: intensity,
                emissive: new THREE.Color(lightColor)
            }
        );

        middlePanelText.computeBoundingBox();

        var box = middlePanelText.boundingBox;

        var boxHeight = (box.max.y - box.min.y) + .03;
        var boxWidth = box.max.x + .03;
        var boxDepth = .005;


        const frontPanel = new RoundedBoxGeometry(boxWidth, boxHeight, boxDepth, 15, 2);
        const frontPanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color("#a5cffc"),
                metalness: .5,
                roughness: 0.8,
                transparent: true,
                opacity: .4
            }
        );

        const middlePanelMesh = new THREE.Mesh(middlePanelText, middlePanelMaterial);
        const backPanelPanelMesh = new THREE.Mesh(frontPanel, frontPanelMaterial);

        const boxGroup = new THREE.Group();
        backPanelPanelMesh.position.copy(middlePanelMesh.position);
        backPanelPanelMesh.position.x += box.max.x / 2;
        backPanelPanelMesh.position.y += box.max.y / 2;
        middlePanelMesh.position.z += boxDepth / 2;

        const frontPanelPanelMesh = backPanelPanelMesh.clone();

        const cylinderGeometry = new THREE.CylinderGeometry(boxDepth * 2, boxDepth * 2, boxDepth * 4, 32);
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(boardColor) }); // 0xff0000
        const cylinderLeft = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

        cylinderLeft.rotation.x = Math.PI / 2;
        cylinderLeft.position.copy(frontPanelPanelMesh.position);
        cylinderLeft.position.z += boxDepth;
        cylinderLeft.position.x -= (box.max.x / 2) - box.max.x * 3 / 100;
        cylinderLeft.position.y += box.max.y / 2;

        const cylinderLeftBottom = cylinderLeft.clone();
        cylinderLeftBottom.position.y -= box.max.y;

        const cylinderRight = cylinderLeft.clone();
        cylinderRight.position.x += (box.max.x) - box.max.x * 3 / 100;

        const cylinderRightBottom = cylinderRight.clone();
        cylinderRightBottom.position.y -= box.max.y;

        frontPanelPanelMesh.position.z += boxDepth * 2;

        boxGroup.add(
            middlePanelMesh,
            backPanelPanelMesh,
            frontPanelPanelMesh,
            cylinderLeft,
            cylinderLeftBottom,
            cylinderRight,
            cylinderRightBottom
        );

        boxGroup.position.set(0, 0, 0);

        scene.add(boxGroup);

        var light = new THREE.AmbientLight(new THREE.Color(lightColor), intensity);
        frontPanelPanelMesh.add(light);
        backPanelPanelMesh.add(light);

        currentObj.push(boxGroup);


        adaptOnView(boxGroup);

        that.render();

        if (animate) {
            that.animateNeonEffect(middlePanelMesh.material, intensity);

            that.render(true);
        }
    }

    ACTNS_NEON.prototype.addNeonTextFormThree = function (
        text = "Hello",
        color = "#eeefff",
        lightColor = "#eeefff",
        intensity = 3,
        fontPath = '',
        animate = false,
        boardColor = "red",
        position = { x: 0, y: 0, z: 0 }) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        let font = new FontLoader().parse(fontPath);

        var middlePanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            depth: .002,
            curveSegments: 20,
            bevelSize: .0005,
            bevelOffset: .001,
            bevelThickness: .005,
            bevelEnabled: true
        });

        const middlePanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color(color),
                metalness: 1,
                roughness: 0.5,
                emissiveIntensity: intensity,
                emissive: new THREE.Color(lightColor)
            }
        );

        const middlePanelMesh = new THREE.Mesh(middlePanelText, middlePanelMaterial);

        middlePanelText.computeBoundingBox();

        var box = middlePanelText.boundingBox;

        var boxHeight = (box.max.y - box.min.y) + .03;
        var boxWidth = box.max.x + .03;
        var boxDepth = .0025;

        const cylinderGeometry = new THREE.CylinderGeometry(boxDepth, boxDepth, boxWidth, 32);
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(boardColor) }); // 0xff0000
        const cylinderTop = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderTop.rotation.z = Math.PI / 2;
        cylinderTop.position.x += box.max.x / 2;
        cylinderTop.position.z -= boxDepth;

        const cylinderBottom = cylinderTop.clone();

        cylinderTop.position.y += box.max.y / 1.3;

        cylinderBottom.position.y += box.max.y / 8;

        const boxGroup = new THREE.Group();

        boxGroup.add(
            middlePanelMesh,
            cylinderTop,
            cylinderBottom
        );

        boxGroup.position.set(0, 0, 0);

        currentObj.push(boxGroup);

        scene.add(boxGroup)

        adaptOnView(boxGroup);

        that.render(true);
    }

    ACTNS_NEON.prototype.addNeonTextFormFour = function (
        text = "Hello",
        color = "#eeefff",
        lightColor = "#eeefff",
        intensity = 5,
        fontPath = '',
        animate = false,
        boardColor = "red",
        position = { x: 0, y: 0, z: 0 }
    ) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        let font = new FontLoader().parse(fontPath);

        var middlePanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            depth: .005,
            curveSegments: 20,
            bevelSize: .0005,
            bevelOffset: .001,
            bevelThickness: .005,
            bevelEnabled: true
        });

        const middlePanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color(lightColor),
                metalness: 1,
                roughness: 0.5,
                emissiveIntensity: intensity,
                emissive: new THREE.Color(lightColor)
            }
        );

        const middlePanelMesh = new THREE.Mesh(middlePanelText, middlePanelMaterial);

        var backPanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            height: .005,
            curveSegments: 20,
            bevelSize: .0005,
            bevelOffset: .001,
            bevelThickness: .005,
            bevelEnabled: true
        });

        const backPanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color(lightColor),
                metalness: .8,
                roughness: 0.5
            }
        );

        const backPanelMesh = new THREE.Mesh(backPanelText, backPanelMaterial);

        var light = new THREE.AmbientLight(new THREE.Color(lightColor), intensity / 2);
        backPanelMesh.add(light)

        middlePanelText.computeBoundingBox();

        backPanelMesh.position.z += .005;

        const boxGroup = new THREE.Group();


        boxGroup.add(
            middlePanelMesh,
            backPanelMesh
        );

        boxGroup.position.set(0, 0, 0);

        currentObj.push(boxGroup);

        scene.add(boxGroup)

        adaptOnView(boxGroup);

        that.render();
    }

    ACTNS_NEON.prototype.addNeonTextFormFive = function (
        text = "Hello",
        color = "#eeefff",
        lightColor = "#eeefff",
        intensity = 2.5,
        fontPath = '',
        animate = false,
        boardColor = "red",
        position = { x: 0, y: 0, z: 0 }
    ) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        let font = new FontLoader().parse(fontPath);

        var middlePanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            depth: .005,
            curveSegments: 20,
            bevelSize: .0005,
            bevelOffset: .001,
            bevelThickness: .005,
            bevelEnabled: true
        });

        const middlePanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color(color),
                metalness: 1,
                roughness: 0.5,
                emissiveIntensity: intensity,
                emissive: new THREE.Color(lightColor)
            }
        );

        const middlePanelMesh = new THREE.Mesh(middlePanelText, middlePanelMaterial);

        var backPanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            height: .005,
            curveSegments: 20,
            bevelSize: .001,
            bevelOffset: .004,
            bevelThickness: .001,
            bevelEnabled: true
        });

        const backPanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color(boardColor),
                metalness: .8,
                roughness: 0.5
            }
        );

        const backPanelMesh = new THREE.Mesh(backPanelText, backPanelMaterial);

        var light = new THREE.AmbientLight(new THREE.Color(lightColor), intensity / 2);
        backPanelMesh.add(light)

        middlePanelText.computeBoundingBox();

        var box = middlePanelText.boundingBox;

        backPanelMesh.position.z -= .005;

        const boxGroup = new THREE.Group();


        boxGroup.add(
            middlePanelMesh,
            backPanelMesh
        );

        boxGroup.position.set(0, 0, 0);

        scene.add(boxGroup);

        currentObj.push(boxGroup);

        adaptOnView(boxGroup);

        that.render();
    }

    ACTNS_NEON.prototype.addNeonTextFormSix = function (
        text = "Hello",
        color = "#eeefff",
        lightColor = "#eeefff",
        intensity = 5,
        fontPath = '',
        animate = true,
        position = { x: 0, y: 0, z: 0 }
    ) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        let font = new FontLoader().parse(fontPath);

        var middlePanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            depth: .0005,
            curveSegments: 20,
            bevelSize: .0005,
            bevelOffset: .001,
            bevelThickness: .005,
            bevelEnabled: true
        });

        const middlePanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color(color),
                metalness: 1,
                roughness: 0.5,
                emissiveIntensity: intensity,
                emissive: new THREE.Color(lightColor)
            }
        );

        const middlePanelMesh = new THREE.Mesh(middlePanelText, middlePanelMaterial);

        var backPanelText = new TextGeometry(text, {
            font: font,
            size: .65,
            depth: .005,
            curveSegments: 20,
            bevelSize: .0001,
            bevelOffset: .005,
            bevelThickness: .0003,
            bevelEnabled: true
        });

        const backPanelMaterial = new THREE.MeshStandardMaterial(
            {
                color: new THREE.Color("#a5cffc"),
                metalness: 0,
                roughness: 0,
                transparent: true,
                opacity: 0.6
            }
        );

        const backPanelMesh = new THREE.Mesh(backPanelText, backPanelMaterial);

        backPanelMesh.position.z -= .001;

        var light = new THREE.AmbientLight(new THREE.Color("#a5cffc"), intensity);
        backPanelMesh.add(light);

        const boxGroup = new THREE.Group();


        boxGroup.add(
            middlePanelMesh,
            backPanelMesh,
            // frontPanelMesh
        );

        boxGroup.position.set(0, 0, 0);

        scene.add(boxGroup);

        currentObj.push(boxGroup);

        adaptOnView(boxGroup);

        that.render();
    }


    function adaptOnView(object) {
        const objBoundingBox = new THREE.Box3().setFromObject(object);
        object.position.y -= objBoundingBox.max.y / 2;
        object.position.x += objBoundingBox.max.x / 2;
        const center = new THREE.Vector3();
        objBoundingBox.getCenter(center);
        object.position.copy(center).negate();
        camera.position.z = Math.max(objBoundingBox.max.y - objBoundingBox.min.y, objBoundingBox.max.x - objBoundingBox.min.x);
    }


    ACTNS_NEON.prototype.addGlowEffect = function (threshold = 0.8, strength = 1, radius = 1, exposure = 1) { // strength = .4
        const that = this;
        const params = {
            threshold: threshold, // Valeur légèrement augmentée
            strength: strength,  // Réduire pour un effet moins intense
            radius: radius,    // Réduire pour un effet plus concentré
            exposure: exposure
        };

        const renderScene = new RenderPass(scene, camera);

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params.strength, params.radius, params.threshold);
        bloomPass.exposure = params.exposure;

        const outputPass = new ShaderPass(CopyShader); // Utilisez le shader CopyShader
        outputPass.renderToScreen = true; // Indique que cette passe doit être rendue à l'écran

        composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);
        composer.addPass(outputPass);
        this.set("composer", composer);
    };



    /**
     * Sets a property to the class.
     * @param {*} key This is the key, the index of the value to add.
     * @param {*} value This is the value to add.
     */
    ACTNS_NEON.prototype.set = function (key, value) {
        if (typeof key === "string")
            this[key] = value;
    }

    /**
     * Retrieves the value of a property from the index key, the parameter.
     * @param {*} key This is the key to the value to be recovered.
     * @returns mixed
     */
    ACTNS_NEON.prototype.get = function (key) {
        return this[key];
    }

    /**
     * Initialize the rendering.
     */
    ACTNS_NEON.prototype.render = function (autopreview = false) {
        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;
        const composer = this.composer;

        const animate = () => {
            if (autopreview)
                requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        const animateComposer = () => {
            if (autopreview)
                requestAnimationFrame(animateComposer);
            composer.render();
        };

        if (typeof composer !== "undefined" && composer !== null) {
            animateComposer();
        } else {
            animate();
        }
    };


    ACTNS_NEON.prototype.removeAllObjects = function () {
        currentObj.forEach(object => {
            scene.remove(object);
        });

        currentObj = [];

        this.render();
    }

    ACTNS_NEON.prototype.createHouse = function () {
        const house = new THREE.Group();
        const textureLoader = new THREE.TextureLoader()
        this.scene.add(house);

        // Load textures
        const bricksColorTexture = textureLoader.load('../assets/textures/bricks/color.jpg');
        const bricksAmbientOcclusionTexture = textureLoader.load('../assets/textures/bricks/ambientOcclusion.jpg');
        const bricksNormalTexture = textureLoader.load('../assets/textures/bricks/normal.jpg');
        const bricksRoughnessTexture = textureLoader.load('../assets/textures/bricks/roughness.jpg');

        const doorColorTexture = textureLoader.load('../assets/textures/door/color.jpg');
        const doorAlphaTexture = textureLoader.load('../assets/textures/door/alpha.jpg');
        const doorAmbientOcclusionTexture = textureLoader.load('../assets/textures/door/ambientOcclusion.jpg');
        const doorHeightTexture = textureLoader.load('../assets/textures/door/height.jpg');
        const doorNormalTexture = textureLoader.load('../assets/textures/door/normal.jpg');
        const doorMetalnessTexture = textureLoader.load('../assets/textures/door/metalness.jpg');
        const doorRoughnessTexture = textureLoader.load('../assets/textures/door/roughness.jpg');

        const grassColorTexture = textureLoader.load('../assets/textures/grass/color.jpg')
        const grassAmbientOcclusionTexture = textureLoader.load('../assets/textures/grass/ambientOcclusion.jpg')
        const grassNormalTexture = textureLoader.load('../assets/textures/grass/normal.jpg')
        const grassRoughnessTexture = textureLoader.load('../assets/textures/grass/roughness.jpg')

        grassColorTexture.repeat.set(8, 8)
        grassAmbientOcclusionTexture.repeat.set(8, 8)
        grassNormalTexture.repeat.set(8, 8)
        grassRoughnessTexture.repeat.set(8, 8)

        grassColorTexture.wrapS = THREE.RepeatWrapping
        grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
        grassNormalTexture.wrapS = THREE.RepeatWrapping
        grassRoughnessTexture.wrapS = THREE.RepeatWrapping

        grassColorTexture.wrapT = THREE.RepeatWrapping
        grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
        grassNormalTexture.wrapT = THREE.RepeatWrapping
        grassRoughnessTexture.wrapT = THREE.RepeatWrapping

        // Walls
        const walls = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2.5, 4),
            new THREE.MeshStandardMaterial({
                map: bricksColorTexture,
                aoMap: bricksAmbientOcclusionTexture,
                normalMap: bricksNormalTexture,
                roughnessMap: bricksRoughnessTexture
            })
        );
        walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2));
        walls.position.y = 1.25;
        house.add(walls);

        // Roof
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(3.5, 1, 4),
            new THREE.MeshStandardMaterial({ color: '#b35f45' })
        );
        roof.position.y = 3;
        roof.rotation.y = Math.PI / 4;
        house.add(roof);

        // Door
        const door = new THREE.Mesh(
            new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
            new THREE.MeshStandardMaterial({
                map: doorColorTexture,
                transparent: true,
                alphaMap: doorAlphaTexture,
                aoMap: doorAmbientOcclusionTexture,
                displacementMap: doorHeightTexture,
                displacementScale: 0.1,
                normalMap: doorNormalTexture,
                metalnessMap: doorMetalnessTexture,
                roughnessMap: doorRoughnessTexture
            })
        );
        door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2));
        door.position.set(0, 1, 2.01);
        house.add(door);

        // Bushes
        const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
        const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });
        const bushes = [
            { scale: 0.5, position: [0.8, 0.2, 2.2] },
            { scale: 0.25, position: [1.4, 0.1, 2.1] },
            { scale: 0.4, position: [-0.8, 0.1, 2.2] },
            { scale: 0.15, position: [-1, 0.05, 2.6] }
        ];

        bushes.forEach(({ scale, position }) => {
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.scale.set(scale, scale, scale);
            bush.position.set(...position);
            bush.castShadow = true
            house.add(bush);
        });

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({
                map: grassColorTexture,
                aoMap: grassAmbientOcclusionTexture,
                normalMap: grassNormalTexture,
                roughnessMap: grassRoughnessTexture
            })
        )

        this.addMoonLight(house, floor)

        return house;
    }

    ACTNS_NEON.prototype.addMoonLight = function (house, floor) {
        
        floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
        floor.rotation.x = - Math.PI * 0.5
        floor.position.y = 0
        scene.add(floor)

        /**
         * Lights
         */
        // Ambient light
        const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
        // gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
        scene.add(ambientLight)

        // Directional light
        const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
        moonLight.position.set(4, 5, - 2)
        // gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
        // gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
        // gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
        // gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
        scene.add(moonLight)


        // Door light
        const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
        doorLight.position.set(0, 2.2, 2.7)
        house.add(doorLight)

        // Ghost
        /**
         * Ghosts
         */
        const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
        scene.add(ghost1)

        const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
        scene.add(ghost2)

        const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
        scene.add(ghost3)

        moonLight.castShadow = true
        doorLight.castShadow = true
        ghost1.castShadow = true
        ghost2.castShadow = true
        ghost3.castShadow = true



        floor.receiveShadow = true
        moonLight.shadow.mapSize.width = 256
        moonLight.shadow.mapSize.height = 256
        moonLight.shadow.camera.far = 15

        // ...

        doorLight.shadow.mapSize.width = 256
        doorLight.shadow.mapSize.height = 256
        doorLight.shadow.camera.far = 7

        // ...

        ghost1.shadow.mapSize.width = 256
        ghost1.shadow.mapSize.height = 256
        ghost1.shadow.camera.far = 7

        // ...

        ghost2.shadow.mapSize.width = 256
        ghost2.shadow.mapSize.height = 256
        ghost2.shadow.camera.far = 7

        // ...

        ghost3.shadow.mapSize.width = 256
        ghost3.shadow.mapSize.height = 256
        ghost3.shadow.camera.far = 7

    }

    return ACTNS_NEON;
})();