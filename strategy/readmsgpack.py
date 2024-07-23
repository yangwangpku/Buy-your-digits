import msgpack

# Define the path to your .msgpack file
file_path = '1-1.msgpack'

# Open the file in binary mode and read the contents
with open(file_path, 'rb') as file:
    data = msgpack.unpack(file, raw=False, strict_map_key=False)

# Print the loaded data
print(data)
