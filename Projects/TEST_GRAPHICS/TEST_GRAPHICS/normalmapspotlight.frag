
#define MaxSpotLights 1

in vec3 WorldPos0;
in vec2 TexCoord0;
in vec3 Normal0;
in vec3 Tangent0;

out vec4 FragColor;

vec3 CalcuteBumpedNormal()
{
    vec3 Normal = normalize(Normal0);
    vec3 Tangent = normalize(Tangent0);
    Tangent = normalize(Tangent - dot(Tangent, Normal) * Normal);
    vec3 Bitangent = cross(Tangent, Normal);
    vec3 BumpMapNormal = texture(Texture2D[1], TexCoord0).xyz;
    BumpMapNormal = 2.0 * BumpMapNormal - vec3(1.0, 1.0, 1.0);
    vec3 NewNormal;
    mat3 TBN = mat3(Tangent, Bitangent, Normal);
    NewNormal = TBN * BumpMapNormal;
    NewNormal = normalize(NewNormal);
	return NewNormal;
}

void main()
{
	vec3 Normal = CalcuteBumpedNormal();

    vec4 ambient = vec4(0.0);
    vec4 diffuse = vec4(0.0);
    vec4 specular = vec4(0.0);
    for(int i = 0; i < SpotLights; i++)
	{
        vec3 dirToObj =  normalize(WorldPos0 - SL[i].Location);
        float dist = length(WorldPos0 - SL[i].Location);

        float spotlightFactor = 0;

        float directionMatch = dot(normalize(SL[i].Direction),dirToObj);


        if (directionMatch > SL[i].InnerAngle) spotlightFactor = 1;
        else if (directionMatch > SL[i].OuterAngle) spotlightFactor = (directionMatch - SL[i].OuterAngle) / (SL[i].InnerAngle - SL[i].OuterAngle);
		
		
        vec4 ambientchange = vec4(0.0);
        vec4 diffusechange = vec4(0.0);
        vec4 specularchange = vec4(0.0);
        ambientchange = vec4(SL[i].La * Material.Ka,1.0);
        float diffuseFactor = dot(normalize(Normal),SL[i].Direction);
        if (diffuseFactor > 0)
		{
            diffusechange = vec4(diffuseFactor * SL[i].Ld * Material.Kd,1.0);
            vec3 VertexToEye = normalize(EyePos-WorldPos0);
            vec3 LightReflect = normalize(reflect(SL[i].Direction,Normal));
            float specularfactor = pow(dot(LightReflect,VertexToEye),Material.SpecularPower);
            if (specularfactor > 0)
				specularchange = vec4(specularfactor * Material.SpecularIntensity * Material.Ks,1.0);
        }

		float attenuation = SL[i].Constant + SL[i].Linear * dist + SL[i].Exp * dist * dist;

        ambient  += spotlightFactor * ambientchange  / attenuation;
        diffuse  += spotlightFactor * diffusechange  / attenuation;
        specular += spotlightFactor * specularchange / attenuation;
	}

	FragColor = (ambient+diffuse + specular) * texture2D(Texture2D[0],TexCoord0.st);
}







