#!/usr/bin/env python3
"""
Test script to debug feature importance issue
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils import global_importance
from app.pipeline_loader import load_pipelines

def test_feature_importance():
    print("Testing feature importance...")
    
    try:
        # Load pipelines
        pipes = load_pipelines()
        print("✅ Pipelines loaded successfully")
        
        # Get feature importance
        importance = global_importance(pipes['reg'])
        print(f"✅ Feature importance retrieved: {len(importance)} features")
        
        # Print top 10 features
        print("\nTop 10 Features:")
        for i, item in enumerate(importance[:10]):
            print(f"{i+1:2d}. {item['feature']:<25} {item['importance']:.4f}")
        
        # Test the API response format
        print("\nAPI Response Format:")
        api_response = {
            "features": importance[:10]
        }
        print(f"Response structure: {type(api_response)}")
        print(f"Number of features: {len(api_response['features'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_feature_importance()
    if success:
        print("\n✅ Feature importance test passed!")
    else:
        print("\n❌ Feature importance test failed!")
