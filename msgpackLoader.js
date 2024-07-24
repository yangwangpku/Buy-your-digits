// msgpackLoader.js

// A map to store preloaded .msgpack files
const strategies = new Map();

// Async function to preload a single .msgpack file
async function preloadMsgpackFile(file) {
    try {
        const response = await fetch(file);
        const data = await response.arrayBuffer();
        strategies.set(file, data);
        console.log(`Preloaded: ${file}`);
    } catch (error) {
        console.error(`Failed to load ${file}:`, error);
    }
}

// Async function to preload multiple .msgpack files
async function preloadMsgpackFiles(files) {
    const preloadPromises = files.map(file => preloadMsgpackFile(file));
    await Promise.all(preloadPromises);
    console.log('All files preloaded');
}

// Async function to load a .msgpack file on demand
async function loadMsgpackFile(file) {
    if (strategies.has(file)) {
        console.log(`Using preloaded data for: ${file}`);
        return strategies.get(file);
    } else {
        try {
            console.log(`Loading on demand: ${file}`);
            const response = await fetch(file);
            const data = await response.arrayBuffer();
            strategies.set(file, data);
            return data;
        } catch (error) {
            console.error(`Failed to load ${file}:`, error);
        }
    }
}


// Export the functions
export {
    preloadMsgpackFile,
    preloadMsgpackFiles,
    loadMsgpackFile
};
