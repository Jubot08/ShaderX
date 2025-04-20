attribute vec3 position;
attribute vec2 uv;
uniform mat4 MVP;
uniform float u_time;

varying vec2 v_uv;
varying vec3 v_pos;

void main() {
    v_uv = uv;
    v_pos = position;
    
    // Water waves
    if (position.y > 0.5) {
        float waveX = sin(u_time * 1.5 + position.x * 10.0) * 0.03;
        float waveZ = cos(u_time * 1.2 + position.z * 8.0) * 0.02;
        v_pos.y += waveX + waveZ;
    }
    
    // Leaf movement
    if (position.y < 0.5) {
        v_pos.y += sin(u_time * 2.0 + position.x * 10.0) * 0.02;
    }
    
    gl_Position = MVP * vec4(v_pos, 1.0);
}
