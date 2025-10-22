# 🦙 Ollama Setup Guide - 100% Free & Open Source AI

This project uses **Ollama** - a completely free, open-source, local AI solution. No API keys, no subscriptions, no cloud dependencies!

## 🚀 Quick Install

### Step 1: Download Ollama

**For Windows:**
1. Visit: https://ollama.ai/download/windows
2. Download the installer
3. Run the installer (it will install Ollama and start the service)

**For macOS:**
```bash
curl https://ollama.ai/install.sh | sh
```

**For Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

### Step 2: Verify Installation

Open a terminal and run:
```bash
ollama --version
```

You should see something like: `ollama version is 0.x.x`

### Step 3: Pull a Model

Download your preferred AI model:

**Recommended for this project:**
```bash
# Llama 2 (7B) - Balanced, good quality
ollama pull llama2

# OR Mistral (7B) - Fast and efficient
ollama pull mistral

# OR Llama 3 (8B) - Latest, highest quality
ollama pull llama3
```

**Other options:**
```bash
# CodeLlama - Programming-focused
ollama pull codellama

# Neural Chat - Conversational
ollama pull neural-chat

# Phi - Smaller, faster
ollama pull phi
```

### Step 4: Test Ollama

```bash
# List installed models
ollama list

# Test the model
ollama run llama2 "Write a professional LinkedIn post about AI"

# Check if service is running
curl http://localhost:11434/api/version
```

## ⚙️ Configure the Project

Update your `.env` file:

```env
LLM_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## 🎯 Model Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| **llama2** | 3.8GB | Medium | Good | General content, balanced |
| **llama3** | 4.7GB | Medium | Excellent | High-quality content |
| **mistral** | 4.1GB | Fast | Good | Quick generation |
| **codellama** | 3.8GB | Medium | Good | Technical content |
| **phi** | 1.6GB | Very Fast | Fair | Quick drafts |

## 🔧 Troubleshooting

### Ollama Not Running

**Windows:**
- Check Windows Services: Search "Services", find "Ollama", ensure it's running
- Or start manually: Open terminal and run `ollama serve`

**macOS/Linux:**
```bash
# Start Ollama service
ollama serve

# Or run as background service
systemctl start ollama  # Linux with systemd
```

### Model Not Found

```bash
# List what you have
ollama list

# Pull the model you need
ollama pull llama2
```

### Connection Failed

```bash
# Check if service is running on correct port
curl http://localhost:11434/api/version

# If not, start Ollama
ollama serve
```

### Slow Generation

- Use a smaller model: `ollama pull phi`
- Update `.env`: `OLLAMA_MODEL=phi`
- Consider upgrading RAM (8GB minimum recommended)

## 💡 Best Practices

### For Quality Content
```env
OLLAMA_MODEL=llama3  # Latest, highest quality
```

### For Speed
```env
OLLAMA_MODEL=mistral  # Fast generation
```

### For Low Resources
```env
OLLAMA_MODEL=phi  # Smallest model
```

## 🎨 Features with Ollama

Once Ollama is running, this project will:

✅ **Generate LinkedIn Posts** - AI-powered professional content  
✅ **Create Post Images** - AI-enhanced titles, subtitles, hashtags  
✅ **Optimize Content** - Smart suggestions and improvements  
✅ **100% Private** - Everything runs locally on your machine  
✅ **Zero Cost** - No API charges, completely free  

## 📊 System Requirements

**Minimum:**
- 8GB RAM
- 10GB free disk space
- Dual-core processor

**Recommended:**
- 16GB RAM
- 20GB free disk space
- Quad-core processor
- SSD storage

## 🔄 Updating Ollama

```bash
# Windows: Download latest installer from ollama.ai

# macOS/Linux:
curl https://ollama.ai/install.sh | sh
```

## 🌟 Advanced Usage

### Run Multiple Models
```bash
ollama pull llama2
ollama pull mistral
ollama pull codellama

# Switch in .env as needed
```

### Custom Model Settings
```bash
# Run with custom parameters
ollama run llama2 --temperature 0.7 --top-p 0.9
```

### GPU Acceleration
Ollama automatically uses GPU if available (NVIDIA CUDA or Apple Metal)

## 📚 Resources

- **Official Website**: https://ollama.ai
- **Documentation**: https://github.com/ollama/ollama/blob/main/docs/README.md
- **Model Library**: https://ollama.ai/library
- **Discord Community**: https://discord.gg/ollama

## ✅ Verification Checklist

After setup, verify everything works:

1. ✅ Ollama installed: `ollama --version`
2. ✅ Service running: `curl http://localhost:11434/api/version`
3. ✅ Model downloaded: `ollama list`
4. ✅ Model works: `ollama run llama2 "Hello"`
5. ✅ Project configured: Check `.env` file
6. ✅ Test image generation: `npm run test-ollama-images`
7. ✅ Generate test post: `npm run generate-post`

---

**You're now running a completely free, open-source, privacy-focused AI content generation system! 🎉**
