precision highp float;

// === UNIFORMS === //
uniform sampler2D u_texture;    // Block texture
uniform sampler2D u_skytex;     // Sky texture
uniform sampler2D u_redstonetex; // Redstone texture
uniform sampler2D u_flowertex;  // Flower glow mask
uniform sampler2D u_moontex;    // Moon phases
uniform sampler2D u_raintex;    // Rain mask
uniform float u_time;           // Time for animations
uniform float u_rain_intensity; // 0-1 rain strength
uniform float u_moon_phase;     // 0-1 moon phase
uniform float u_redstone_power; // 0-1 Redstone intensity

// === VARYINGS === //
varying vec2 v_uv;
varying vec3 v_pos;

// ==================== //
// === CORE EFFECTS === //
// ==================== //

vec3 calculateWaterReflection(vec2 uv, vec3 viewDir) {
    vec2 reflectionUV = vec2(uv.x, 1.0 - uv.y);
    vec3 skyColor = texture2D(u_skytex, reflectionUV).rgb;
    float fresnel = 0.1 + 0.9 * pow(1.0 - dot(vec3(0.0, 1.0, 0.0), 5.0);
    return mix(vec3(0.0), skyColor, fresnel);
}

vec3 applyWetGround(vec3 color, vec3 pos, vec2 uv) {
    if (pos.y < 0.1) {
        float wetness = texture2D(u_raintex, uv * 2.0).r;
        vec3 reflection = calculateWaterReflection(uv, normalize(pos));
        return mix(color, reflection, wetness * 0.4);
    }
    return color;
}

// ======================= //
// === LIGHTING EFFECTS === //
// ======================= //

vec3 applyRedstoneGlow(vec3 color, vec2 uv) {
    vec4 redstoneData = texture2D(u_redstonetex, uv);
    float power = redstoneData.r * u_redstone_power;
    
    if (power > 0.1) {
        vec3 glowColor = mix(vec3(1.0, 0.1, 0.1), vec3(1.0, 0.4, 0.1), 
                           sin(u_time * 3.0) * 0.5 + 0.5);
        return max(color, glowColor * power * 2.5);
    }
    return color;
}

vec3 applyTorchLight(vec3 color, vec2 uv) {
    float torchMask = texture2D(u_redstonetex, uv).g; // Green channel for torches
    if (torchMask > 0.1) {
        vec3 torchColor = vec3(1.0, 0.6, 0.2);
        float flicker = 0.8 + 0.2 * sin(u_time * 10.0);
        return max(color, torchColor * torchMask * flicker * 2.0);
    }
    return color;
}

// ====================== //
// === NATURE EFFECTS === //
// ====================== //

vec3 applyFlowerGlow(vec3 color, vec2 uv) {
    vec4 flowerData = texture2D(u_flowertex, uv);
    if (flowerData.a > 0.5) {
        vec3 glowColor = vec3(flowerData.rgb) * vec3(1.5, 2.0, 1.8);
        float pulse = sin(u_time * 1.2) * 0.1 + 0.9;
        return color + glowColor * pulse * 0.8;
    }
    return color;
}

vec3 applyMoonlight(vec3 color, vec2 uv) {
    vec3 moonColor = vec3(0.7, 0.8, 1.0);
    float moonMask = texture2D(u_moontex, uv).r;
    if (moonMask > 0.3) {
        float halo = smoothstep(0.3, 0.6, moonMask) * 0.5;
        return color + moonColor * halo;
    }
    return color;
}

// ===================== //
// === WEATHER EFFECTS === //
// ===================== //

vec3 applyRainMist(vec3 color, vec3 pos) {
    if (u_rain_intensity > 0.1) {
        vec3 mistColor = mix(vec3(0.4, 0.6, 0.9), vec3(0.2, 0.3, 0.6), 
                           smoothstep(0.7, 0.9, u_time));
        float mistDensity = u_rain_intensity * (1.0 - pos.y * 0.5);
        return mix(color, mistColor, mistDensity * 0.6);
    }
    return color;
}

// ================== //
// === MAIN RENDER === //
// ================== //

void main() {
    vec3 color = texture2D(u_texture, v_uv).rgb;
    
    // Apply all effects (order matters!)
    color = applyWetGround(color, v_pos, v_uv);
    color = applyRedstoneGlow(color, v_uv);
    color = applyTorchLight(color, v_uv);
    color = applyFlowerGlow(color, v_uv);
    color = applyMoonlight(color, v_uv);
    color = applyRainMist(color, v_pos);
    
    // Water reflections (if water exists in the scene)
    if (v_pos.y > 0.5) {
        vec3 reflection = calculateWaterReflection(v_uv, normalize(v_pos));
        color = mix(color, reflection, 0.6);
    }
    
    gl_FragColor = vec4(color, 1.0);
}
