// Standard Bedrock shader variables
precision highp float;
varying vec2 v_uv;          // Texture coordinates
varying vec3 v_pos;         // World position
uniform sampler2D u_texture; // Block texture sampler
uniform sampler2D u_skytex;  // Sky texture sampler (for reflections)
uniform float u_time;       // Time uniform for animations

// Water reflection calculation (original)
vec3 calculateWaterReflection(vec2 uv, vec3 viewDir) {
    vec2 reflectionUV = vec2(uv.x, 1.0 - uv.y); // Flip Y for reflection
    vec3 skyColor = texture2D(u_skytex, reflectionUV).rgb;
    float fresnel = 0.1 + 0.9 * pow(1.0 - dot(vec3(0.0, 1.0, 0.0), viewDir), 5.0);
    return mix(vec3(0.0), skyColor, fresnel);
}

// Leaf subsurface scattering simulation
vec3 applyLeafLight(vec3 color) {
    return color * vec3(0.9, 1.0, 0.8); // Greenish tint
}

void main() {
    vec3 color = texture2D(u_texture, v_uv).rgb;

    // === CUSTOM EFFECTS === //
    // 1. Water reflections (if Y position is high)
    if (v_pos.y > 0.5) {
        vec3 reflection = calculateWaterReflection(v_uv, normalize(v_pos));
        color = mix(color, reflection, 0.6); // 0.6 = reflection intensity
    }

    // 2. Leaf light effect (simulated subsurface)
    if (v_pos.y < 0.2 && v_pos.x > 0.4) { // Leaf block detection
        color = applyLeafLight(color);
    }

    // 3. Simple water waves (optional)
    if (v_pos.y > 0.5) {
        float wave = sin(u_time + v_pos.x * 10.0) * 0.02;
        color.rgb *= 1.0 + wave;
    }

    gl_FragColor = vec4(color, 1.0);
}
