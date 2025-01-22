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
        camera = new THREE.PerspectiveCamera(75, canvasSelector.offsetWidth / canvasSelector.offsetHeight, 0.1, 10000);
        renderer.setSize(canvasSelector.offsetWidth, canvasSelector.offsetHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xFEFEFE, 0);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.shadowMap.enabled = true;
        canvasSelector.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.minPolarAngle = 0; // Minimum polar angle (vertical rotation)
        controls.maxPolarAngle = Math.PI; // Maximum polar angle (vertical rotation)

        controls.update();
        // Assurez-vous que la caméra ne peut pas regarder en dessous du plan
        function updateCamera() {
            var camPos = camera.position;
            var planeHeight = 0; // Hauteur à laquelle se trouve le plan


            if (camPos.y < planeHeight) {
                camPos.y = planeHeight; // Maintenir la caméra au niveau du plan
            }
        }

        // Appeler cette fonction chaque fois que la caméra est mise à jour
        // controls.addEventListener('change', updateCamera);
        // updateCamera(); // Appel initial pour mettre à jour la caméra selon les contraintes


        controls.addEventListener('change', () => { this.render() });
        this.set("scene", scene);
        this.set("camera", camera);
        this.set("controls", controls);
        this.set("renderer", renderer);
        this.addLight();
        // this.addScene();
        this.addGlowEffect(2);

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
        // Créez une lumière de contre-jour
        var contreJour = new THREE.DirectionalLight(0xffffff, .1);
        contreJour.position.set(-1, .2, -1); // Vers l'arrière de la scène
        scene.add(contreJour);

        // Créez une lumière de jour
        var jour = new THREE.DirectionalLight(0xffffff, .1);
        jour.position.set(1, .2, 1); // Vers l'avant de la scène
        scene.add(jour);


        this.render();
    }

    ACTNS_NEON.prototype.addNeonTextFormOne = function (
        text = "Hello",
        color = "#eeefff",
        lightColor = "#eeefff",
        intensity = 2.5,
        fontPath = '',
        position = { x: 0, y: 0, z: 0 }
    ) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;
    
        if (fontPath === '') fontPath = defaultFontPath;
    
        loader.load(fontPath, function (font) {
    
            var textGeometry = new TextGeometry(text, {
                font: font,
                size: .65,
                height: .05,
                curveSegments: 20,
                bevelSize: .0005,
                bevelOffset: .001,
                bevelThickness: .005,
                bevelEnabled: true
            });
    
            const textMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                metalness: 1,
                roughness: 0.5,
                emissiveIntensity: 0, // Commence avec une lumière éteinte
                emissive: new THREE.Color(lightColor)
            });
    
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            scene.add(textMesh);
            currentObj.push(textMesh);
            textMesh.position.set(position.x, position.y, position.z);
    
            adaptOnView(textMesh);
            that.render();
    
            // Animation de la lumière en boucle
            that.animateNeonEffect(textMesh.material, intensity);

            that.render(true);

        });
    };

    ACTNS_NEON.prototype.animateNeonEffect = function(material, intensity) {
        gsap.to(material, {
            emissiveIntensity: intensity, 
            duration: 1.5,
            repeat: -1,
            yoyo: true, 
            ease: "elastic.out",
            stagger: .2,
        });
    }

    ACTNS_NEON.prototype.addNeonTextFormTwo = function (text = "Hello", color = "#eeefff", lightColor = "#eeefff", intensity = 4, fontPath = '', boardColor = 'red', position = {x: 0, y: 0, z: 0}) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        loader.load(fontPath, function (font) {

            var middlePanelText = new TextGeometry(text, {
                font: font,
                size: .65,
                height: .05,
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

            var boxHeight = (box.max.y - box.min.y) + .3;
            var boxWidth = box.max.x + .3;
            var boxDepth = .05;


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
        })
    }

    ACTNS_NEON.prototype.addNeonTextFormThree = function (text = "Hello", color = "#eeefff", lightColor = "#eeefff", intensity = 3, fontPath = '', boardColor = "red", position = {x: 0, y: 0, z: 0}) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        loader.load(fontPath, function (font) {

            var middlePanelText = new TextGeometry(text, {
                font: font,
                size: .65,
                height: .05,
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

            var boxHeight = (box.max.y - box.min.y) + .3;
            var boxWidth = box.max.x + .3;
            var boxDepth = .025;

            const cylinderGeometry = new THREE.CylinderGeometry(boxDepth, boxDepth, boxWidth, 32);
            const cylinderMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(boardColor) }); // 0xff0000
            const cylinderTop = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            cylinderTop.rotation.z = Math.PI / 2;
            cylinderTop.position.x += box.max.x / 2;
            cylinderTop.position.z -= boxDepth;

            const cylinderBottom = cylinderTop.clone();

            cylinderTop.position.y += box.max.y / 2;

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
        })
    }

    ACTNS_NEON.prototype.addNeonTextFormFour = function (text = "Hello", color = "#eeefff", lightColor = "#eeefff", intensity = 5, fontPath = '', boardColor = "red", position = {x: 0, y: 0, z: 0}) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        loader.load(fontPath, function (font) {

            var middlePanelText = new TextGeometry(text, {
                font: font,
                size: .65,
                height: .05,
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
                height: .05,
                curveSegments: 20,
                bevelSize: .0005,
                bevelOffset: .001,
                bevelThickness: .005,
                bevelEnabled: true
            });

            const backPanelMaterial = new THREE.MeshStandardMaterial(
                {
                    color: new THREE.Color(color),
                    metalness: .8,
                    roughness: 0.5
                }
            );

            const backPanelMesh = new THREE.Mesh(backPanelText, backPanelMaterial);

            var light = new THREE.AmbientLight(new THREE.Color(lightColor), intensity / 2);
            backPanelMesh.add(light)

            middlePanelText.computeBoundingBox();

            var box = middlePanelText.boundingBox;

            var boxHeight = (box.max.y - box.min.y) + .3;
            var boxWidth = box.max.x + .3;
            var boxDepth = .025;

            backPanelMesh.position.z += .05;

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
        })
    }

    ACTNS_NEON.prototype.addNeonTextFormFive = function (text = "Hello", color = "#eeefff", lightColor = "#eeefff", intensity = 2.5, fontPath = '', boardColor = "red", position = {x: 0, y: 0, z: 0}) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        loader.load(fontPath, function (font) {

            var middlePanelText = new TextGeometry(text, {
                font: font,
                size: .65,
                height: .05,
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
                height: .05,
                curveSegments: 20,
                bevelSize: .01,
                bevelOffset: .04,
                bevelThickness: .01,
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

            backPanelMesh.position.z -= .05;

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
        })
    }

    ACTNS_NEON.prototype.addNeonTextFormSix = function (text = "Hello", color = "#eeefff", lightColor = "#eeefff", intensity = 5, fontPath = '', boardColor = "red", position = {x: 0, y: 0, z: 0}) {
        const defaultFontPath = '../assets/font/Sweet Charlie_Regular.json',
            loader = new FontLoader(),
            that = this;

        if (fontPath === '') fontPath = defaultFontPath;

        loader.load(fontPath, function (font) {

            var middlePanelText = new TextGeometry(text, {
                font: font,
                size: .65,
                height: .05,
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
                height: .17,
                curveSegments: 20,
                bevelSize: .05,
                bevelOffset: .04,
                bevelThickness: .005,
                bevelEnabled: true
            });

            const backPanelMaterial = new THREE.MeshStandardMaterial(
                {
                    color: new THREE.Color("#a5cffc"),
                    metalness: .5,
                    roughness: 0.8,
                    transparent: true,
                    opacity: 0.6
                }
            );

            const backPanelMesh = new THREE.Mesh(backPanelText, backPanelMaterial);

            backPanelMesh.position.z -= .07;

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
        })
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


    ACTNS_NEON.prototype.addGlowEffect = function (threshold = 0.8, strength = .4, radius = 1, exposure = 1) {
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
    ACTNS_NEON.prototype.render = function(autopreview = false) {
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


    return ACTNS_NEON;
})();