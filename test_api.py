import requests
import json
import base64
from pathlib import Path

# API endpoint
API_URL = "http://127.0.0.1:8000"

def test_generate_image():
    """Test image generation"""
    print("Testing image generation...")
    
    payload = {
        "prompt": "an ocean with fishes, digital art",
        "negative_prompt": "blurry, low quality",
        "seed": 42,
        "save_image": True
    }
    
    try:
        response = requests.post(f"{API_URL}/generate", json=payload)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Success! Generated image:")
        print(f"   Size: {result['size_bytes']} bytes")
        print(f"   Saved to: {result['saved_path']}")
        print(f"   Prompt: {result['prompt']}")
        print(f"   Seed: {result['seed']}")
        
        # Optionally save the base64 image to a separate file
        if "image" in result:
            img_data = base64.b64decode(result["image"])
            test_path = Path("test_output.png")
            test_path.write_bytes(img_data)
            print(f"   Also saved copy to: {test_path}")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                print(f"   Error details: {error_detail}")
            except:
                print(f"   Response text: {e.response.text}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_list_images():
    """Test listing saved images"""
    print("\nTesting image listing...")
    
    try:
        response = requests.get(f"{API_URL}/images")
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Found {result['count']} saved images:")
        
        for img in result['images'][:5]:  # Show first 5 images
            print(f"   📁 {img['filename']} ({img['size_bytes']} bytes)")
            
        return True
        
    except Exception as e:
        print(f"❌ Failed to list images: {e}")
        return False

def test_health():
    """Test health check"""
    print("\nTesting health check...")
    
    try:
        response = requests.get(f"{API_URL}/health")
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ API is healthy: {result['status']}")
        return True
        
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing ComfyUI-as-a-Service API")
    print("="*50)
    
    # Test health first
    if not test_health():
        print("\n❌ API appears to be down. Make sure it's running with:")
        print("   uvicorn api_server:app --host 0.0.0.0 --port 8000")
        exit(1)
    
    # Test image generation
    if test_generate_image():
        print("\n🎉 Image generation test passed!")
    else:
        print("\n💥 Image generation test failed!")
    
    # Test listing images
    test_list_images()
    
    print("\n" + "="*50)
    print("Testing complete!")
    print("\nTry these curl commands too:")
    print(f"""
curl -X POST {API_URL}/generate \\
  -H "Content-Type: application/json" \\
  -d '{{"prompt":"a magical forest with glowing mushrooms","seed":123}}'

curl {API_URL}/images

curl {API_URL}/health
""")