import { Canvas, useFrame } from "@react-three/fiber";
import { observer } from "mobx-react";
import { useRef, useState } from "react";
import type { Group } from "three";

function Box() {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef<Group>();
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        ref.current!.rotation.x += delta * state.pointer.x * 10;
        ref.current!.rotation.z += delta * state.pointer.y * 10;
    });
    // Return the view, these are regular Threejs elements expressed in JSX
    const plateSize = 0.5;
    const gap = plateSize + 0.1;
    return (
        <group ref={ref as any}>
            <mesh position={[0, gap, 0]}>
                <cylinderGeometry args={[1, 1, plateSize]} />
                <meshStandardMaterial color="lime" />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[1, 1, plateSize]} />
                <meshStandardMaterial color="green" />
            </mesh>
            <mesh position={[0, -gap, 0]}>
                <cylinderGeometry args={[1, 1, plateSize]} />
                <meshStandardMaterial color="rgb(70, 31, 4)" />
            </mesh>
        </group>
    );
}

export const SplashScreen = observer(() => {
    return (
        <div className="h-full">
            <Canvas>
                <ambientLight intensity={Math.PI / 2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

                <Box />
            </Canvas>
        </div>
    );
});
