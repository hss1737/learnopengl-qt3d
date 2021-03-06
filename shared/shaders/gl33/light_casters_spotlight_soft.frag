#version 330 core

struct Material {
	sampler2D diffuse;
	sampler2D specular;
	float shininess;
};

struct Light {
	vec3 position;
	vec3 direction;
	float cutOff;
	float outerCutOff;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;

	float constant;
	float linear;
	float quadratic;
};

in vec3 normal;
in vec3 fragPos;
in vec2 texCoord;

out vec4 color;

uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main()
{
	vec3 vecToLight = light.position - fragPos;

	// Ambient
	vec3 ambient = light.ambient * vec3(texture2D(material.diffuse, texCoord));
	vec3 result = ambient;

	// Diffuse
	vec3 norm = normalize(normal);
	vec3 lightDir = normalize(vecToLight);
	float diff = max(dot(norm, lightDir), 0.0f);
	vec3 diffuse = light.diffuse * diff * vec3(texture2D(material.diffuse, texCoord));

	// Specular
	vec3 viewDir = normalize(viewPos - fragPos);
	vec3 reflectDir = reflect(-lightDir, norm);
	float spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);
	vec3 specular = light.specular * spec * vec3(texture2D(material.specular, texCoord));

	// Spotlight (soft edges)
	float theta = dot(lightDir, normalize(-light.direction));
	float intensity = smoothstep(light.outerCutOff, light.cutOff, theta);

	// Attenuation
	float distance = length(vecToLight);
	float attenuation = 1.0f / (light.constant + distance * (light.linear + distance * light.quadratic));

	result += (diffuse + specular) * intensity * attenuation;

	color = vec4(result, 1.0f);
}
