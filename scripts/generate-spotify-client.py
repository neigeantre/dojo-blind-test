import os
import json

# Load OpenAPI spec file
with open("./openapi.json", "r") as f:
    openapi = json.load(f)

target_directory = "src/lib/spotify/model"

def generate_spotify_client():
    print("\nLaunched generate-spotify-client script")
    print('Generating Spotify client from OpenApi spec file...\n')
    
    # Generate target directory
    os.makedirs(target_directory, exist_ok=True)
    
    schemas = openapi["components"]["schemas"]
    types_to_generate = schemas.keys()
    
    for type_name in types_to_generate:
        type_schema = schemas[type_name]
        generate_type(type_name, type_schema)

def generate_type(type_name, type_schema):
    print(f"Generating type {type_name}...")
    
    generated_code = get_generated_code(type_name, type_schema)
    
    # Write the generated TypeScript code to a file
    with open(f"{target_directory}/{type_name}.ts", "w") as f:
        f.write(generated_code)

def get_generated_code(type_name, type_schema):
    generated_type = get_generated_type(type_schema)
    return f"export type {type_name} = {generated_type};"

def get_generated_type(type_schema):
    schema_type = type_schema.get("type")
    
    # TO DO: Generate typescript code from schema
    match schema_type:
        case "number" | "integer" | "string" | "boolean" | "array" | "object":
            return ""
        case _:
            return ""


# Run the generation script
generate_spotify_client()
