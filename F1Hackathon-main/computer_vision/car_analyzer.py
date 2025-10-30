"""
F1 Car Image Analyzer
Analyzes static 3D car images to extract aerodynamic features
"""
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, Optional

from config.settings import CAR_IMAGES_DIR, TEAM_ABBREV, CV_IMAGE_SIZE, CV_EDGE_DETECTION_THRESHOLD


class F1CarImageAnalyzer:
    """
    Analyzes F1 car images to extract aerodynamic characteristics
    """
    
    def __init__(self):
        self.image_dir = CAR_IMAGES_DIR
        self.target_size = CV_IMAGE_SIZE
    
    def load_team_images(self, team_name: str) -> Dict[str, np.ndarray]:
        """Load all available images for a team"""
        team_abbrev = TEAM_ABBREV.get(team_name, team_name[:3].upper())
        team_dir = self.image_dir / team_abbrev
        
        images = {}
        views = ['front', 'rear', 'side', 'top']
        
        if team_dir.exists():
            for view in views:
                for ext in ['.png', '.jpg', '.jpeg']:
                    img_path = team_dir / f"{view}{ext}"
                    if img_path.exists():
                        try:
                            img = cv2.imread(str(img_path))
                            if img is not None:
                                img = cv2.resize(img, self.target_size)
                                images[view] = img
                        except:
                            pass
                        break
        
        return images
    
    def analyze_frontal_area(self, front_image: np.ndarray) -> float:
        """Estimate frontal area from front view"""
        gray = cv2.cvtColor(front_image, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY)
        car_pixels = np.sum(thresh > 0)
        total_pixels = thresh.shape[0] * thresh.shape[1]
        pixel_ratio = car_pixels / total_pixels
        estimated_area = 1.4 * (pixel_ratio / 0.35)
        return max(1.2, min(1.6, estimated_area))
    
    def estimate_drag_coefficient(self, images: Dict[str, np.ndarray]) -> float:
        """Estimate drag coefficient from car shape"""
        if 'side' not in images:
            return 0.70
        
        side_img = images['side']
        gray = cv2.cvtColor(side_img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, CV_EDGE_DETECTION_THRESHOLD, CV_EDGE_DETECTION_THRESHOLD * 2)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            aspect_ratio = w / h if h > 0 else 2.5
            
            if aspect_ratio > 2.8:
                return 0.68
            elif aspect_ratio > 2.5:
                return 0.70
            else:
                return 0.73
        
        return 0.70
    
    def comprehensive_analysis(self, team_name: str) -> Dict:
        """Perform comprehensive analysis of team's car"""
        images = self.load_team_images(team_name)
        
        if not images:
            return {
                'images_available': False,
                'frontal_area': 1.4,
                'aerodynamic_metrics': {
                    'estimated_cd': 0.70,
                    'front_wing_angle': 22.0,
                    'rear_wing_angle': 26.0
                }
            }
        
        frontal_area = 1.4
        if 'front' in images:
            frontal_area = self.analyze_frontal_area(images['front'])
        
        cd = self.estimate_drag_coefficient(images)
        
        return {
            'images_available': True,
            'images_found': list(images.keys()),
            'frontal_area': frontal_area,
            'aerodynamic_metrics': {
                'estimated_cd': cd,
                'front_wing_angle': 22.0,
                'rear_wing_angle': 26.0
            }
        }