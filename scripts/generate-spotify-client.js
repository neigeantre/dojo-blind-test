import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  console.log("\nLaunched generate-spotify-client script");
  console.log('Generating Spotify client from OpenApi spec file...\n')
  await mkdir(targetDirectory, { recursive: true }); // Generate target directory

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    generateType(typeName, typeSchema);
  }
}

function generateType(typeName, typeSchema) {  
  console.log(`Generating type ${typeName}...`);

  const generatedCode = getGeneratedCode(typeName, typeSchema);

  writeFile(`${targetDirectory}/${typeName}.ts`, generatedCode);
}

function getGeneratedCode(typeName, typeSchema) {
  const imports = new Set()
  const generatedType = getGeneratedType(typeSchema, imports);

  let importCode = "";
  imports.forEach((typeName) => {
    importCode += `import { ${typeName} } from "./${typeName}";\n`;
  });

  if (importCode != "") {
    importCode += "\n"
  }

  return `${importCode}export type ${typeName} = ${generatedType};`;
}

function getGeneratedType(typeSchema, imports) {
  const schemaType = typeSchema.type;

  // TO DO: Generate typescript code from schema
  if (typeSchema.$ref != undefined) {
    const path = typeSchema.$ref
    const typeName = path.split("/").at(-1)
    imports.add(typeName)
    return typeName
  }

  if (typeSchema.oneOf != undefined) {
    const types = typeSchema.oneOf.map((subTypeSchema) => {
      return getGeneratedType(subTypeSchema, imports)
    })
    let generatedCode = "("
    for (let index = 0; index < types.length - 1; index++) {
      generatedCode += `${types[index]} | `;
    }
    generatedCode += types.at(-1)
    generatedCode += ")"
    
    return generatedCode
  }

  if (typeSchema.allOf != undefined) {
    const types = typeSchema.allOf.map((subTypeSchema) => {
      return getGeneratedType(subTypeSchema, imports)
    })
    let generatedCode = ""
    for (let index = 0; index < types.length - 1; index++) {
      generatedCode += `${types[index]} & `;
    }
    generatedCode += types.at(-1)
    
    return generatedCode  
  }

  if (typeSchema.enum != undefined) {
    const values = typeSchema.enum
    let generatedCode = ""

    for (let index = 0; index < values.length - 1; index++) {
      generatedCode += `"${values[index]}" | `;
    }
    generatedCode += `"${values.at(-1)}"`

    return generatedCode
  }

  switch (schemaType) {
    case "number":
      return "number"
    case "integer":
      return "number"
    case "string":
      return "string"
    case "boolean":
      return "boolean"
    case "array":
      const typeName = getGeneratedType(typeSchema.items, imports)
      return `${typeName}[]`
    case "object":
      if (typeSchema.properties != undefined) {
        const requiredFields = typeSchema.required ?? []

        let generatedCode = "{\n"
        Object.keys(typeSchema.properties).forEach((propertyName) => {
          const subTypeSchema = typeSchema.properties[propertyName]
          const type = getGeneratedType(subTypeSchema, imports)

          if (requiredFields.includes(propertyName)) {
            generatedCode += `\t${propertyName}: ${type};\n`
          } else {
            generatedCode += `\t${propertyName}?: ${type};\n`
          }
        })
        generatedCode += "}"
        return generatedCode
      }
    default:
      return "";
  }
}

generateSpotifyClient();