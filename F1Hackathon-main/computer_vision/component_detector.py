"""
computer_vision/component_detector.py
Detect and locate specific aerodynamic components in F1 car images
"""

import cv2
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

from config.settings import AERODYNAMIC_COMPONENTS


@dataclass
class ComponentLocation:
    """Location and properties of a detected component"""
    component_name: str
    bounding_box: Tuple[int, int, int, int]  # x, y, width, height
    confidence: float
    center: Tuple[int, int]
    area: float


class ComponentDetector:
    """
    Detect and locate aerodynamic components in F1 car images
    """
    
    def __init__(self):
        self.components = AERODYNAMIC_COMPONENTS
        self.detection_cache = {}
    
    def detect_all_components(self, images: Dict[str, np.ndarray]) -> Dict[str, List[ComponentLocation]]:
        """
        Detect all aerodynamic components from multiple views
        
        Args:
            images: Dictionary with view names and image arrays
            
        Returns:
            Dictionary mapping component names to their locations
        """
        all_detections = {}
        
        # Detect components from each view
        if 'front' in images:
            front_components = self.detect_from_front_view(images['front'])
            all_detections.update(front_components)
        
        if 'side' in images:
            side_components = self.detect_from_side_view(images['side'])
            all_detections.update(side_components)
        
        if 'top' in images:
            top_components = self.detect_from_top_view(images['top'])
            all_detections.update(top_components)
        
        if 'rear' in images:
            rear_components = self.detect_from_rear_view(images['rear'])
            all_detections.update(rear_components)
        
        return all_detections
    
    def detect_from_front_view(self, front_image: np.ndarray) -> Dict[str, List[ComponentLocation]]:
        """
        Detect components visible from front view
        
        Args:
            front_image: Front view image
            
        Returns:
            Dictionary of detected components
        """
        detections = {}
        
        height, width = front_image.shape[:2]
        
        # Detect front wing
        front_wing_roi = self._get_roi(front_image, (0.1, 0.7), (0.9, 0.95))
        front_wing = self._detect_front_wing(front_wing_roi)
        if front_wing:
            # Adjust coordinates to full image
            front_wing.bounding_box = (
                int(front_wing.bounding_box[0] + width * 0.1),
                int(front_wing.bounding_box[1] + height * 0.7),
                front_wing.bounding_box[2],
                front_wing.bounding_box[3]
            )
            detections['front_wing'] = [front_wing]
        
        # Detect nose
        nose_roi = self._get_roi(front_image, (0.3, 0.4), (0.7, 0.7))
        nose = self._detect_nose(nose_roi)
        if nose:
            nose.bounding_box = (
                int(nose.bounding_box[0] + width * 0.3),
                int(nose.bounding_box[1] + height * 0.4),
                nose.bounding_box[2],
                nose.bounding_box[3]
            )
            detections['nose'] = [nose]
        
        # Detect wheels (front)
        wheels = self._detect_wheels(front_image, 'front')
        if wheels:
            detections['wheels_front'] = wheels
        
        return detections
    
    def detect_from_side_view(self, side_image: np.ndarray) -> Dict[str, List[ComponentLocation]]:
        """
        Detect components visible from side view
        
        Args:
            side_image: Side view image
            
        Returns:
            Dictionary of detected components
        """
        detections = {}
        
        height, width = side_image.shape[:2]
        
        # Detect front wing
        front_wing_roi = self._get_roi(side_image, (0.0, 0.5), (0.25, 0.85))
        front_wing = self._detect_front_wing_side(front_wing_roi)
        if front_wing:
            front_wing.bounding_box = (
                int(front_wing.bounding_box[0]),
                int(front_wing.bounding_box[1] + height * 0.5),
                front_wing.bounding_box[2],
                front_wing.bounding_box[3]
            )
            detections['front_wing'] = [front_wing]
        
        # Detect rear wing
        rear_wing_roi = self._get_roi(side_image, (0.75, 0.2), (1.0, 0.65))
        rear_wing = self._detect_rear_wing(rear_wing_roi)
        if rear_wing:
            rear_wing.bounding_box = (
                int(rear_wing.bounding_box[0] + width * 0.75),
                int(rear_wing.bounding_box[1] + height * 0.2),
                rear_wing.bounding_box[2],
                rear_wing.bounding_box[3]
            )
            detections['rear_wing'] = [rear_wing]
        
        # Detect floor
        floor_roi = self._get_roi(side_image, (0.2, 0.75), (0.8, 0.95))
        floor = self._detect_floor(floor_roi)
        if floor:
            floor.bounding_box = (
                int(floor.bounding_box[0] + width * 0.2),
                int(floor.bounding_box[1] + height * 0.75),
                floor.bounding_box[2],
                floor.bounding_box[3]
            )
            detections['floor'] = [floor]
        
        # Detect sidepods
        sidepod_roi = self._get_roi(side_image, (0.3, 0.35), (0.7, 0.75))
        sidepod = self._detect_sidepod(sidepod_roi)
        if sidepod:
            sidepod.bounding_box = (
                int(sidepod.bounding_box[0] + width * 0.3),
                int(sidepod.bounding_box[1] + height * 0.35),
                sidepod.bounding_box[2],
                sidepod.bounding_box[3]
            )
            detections['sidepods'] = [sidepod]
        
        # Detect diffuser
        diffuser_roi = self._get_roi(side_image, (0.6, 0.75), (0.9, 0.92))
        diffuser = self._detect_diffuser(diffuser_roi)
        if diffuser:
            diffuser.bounding_box = (
                int(diffuser.bounding_box[0] + width * 0.6),
                int(diffuser.bounding_box[1] + height * 0.75),
                diffuser.bounding_box[2],
                diffuser.bounding_box[3]
            )
            detections['diffuser'] = [diffuser]
        
        return detections
    
    def detect_from_top_view(self, top_image: np.ndarray) -> Dict[str, List[ComponentLocation]]:
        """
        Detect components visible from top view
        
        Args:
            top_image: Top view image
            
        Returns:
            Dictionary of detected components
        """
        detections = {}
        
        height, width = top_image.shape[:2]
        
        # Detect sidepods (both sides)
        left_sidepod_roi = self._get_roi(top_image, (0.0, 0.3), (0.4, 0.7))
        right_sidepod_roi = self._get_roi(top_image, (0.6, 0.3), (1.0, 0.7))
        
        left_sidepod = self._detect_sidepod(left_sidepod_roi)
        right_sidepod = self._detect_sidepod(right_sidepod_roi)
        
        sidepods = []
        if left_sidepod:
            left_sidepod.bounding_box = (
                int(left_sidepod.bounding_box[0]),
                int(left_sidepod.bounding_box[1] + height * 0.3),
                left_sidepod.bounding_box[2],
                left_sidepod.bounding_box[3]
            )
            sidepods.append(left_sidepod)
        
        if right_sidepod:
            right_sidepod.bounding_box = (
                int(right_sidepod.bounding_box[0] + width * 0.6),
                int(right_sidepod.bounding_box[1] + height * 0.3),
                right_sidepod.bounding_box[2],
                right_sidepod.bounding_box[3]
            )
            sidepods.append(right_sidepod)
        
        if sidepods:
            detections['sidepods'] = sidepods
        
        # Detect rear wing
        rear_wing_roi = self._get_roi(top_image, (0.3, 0.8), (0.7, 1.0))
        rear_wing = self._detect_rear_wing_top(rear_wing_roi)
        if rear_wing:
            rear_wing.bounding_box = (
                int(rear_wing.bounding_box[0] + width * 0.3),
                int(rear_wing.bounding_box[1] + height * 0.8),
                rear_wing.bounding_box[2],
                rear_wing.bounding_box[3]
            )
            detections['rear_wing'] = [rear_wing]
        
        # Detect floor edges
        floor_roi = self._get_roi(top_image, (0.15, 0.3), (0.85, 0.8))
        floor = self._detect_floor_edges(floor_roi)
        if floor:
            floor.bounding_box = (
                int(floor.bounding_box[0] + width * 0.15),
                int(floor.bounding_box[1] + height * 0.3),
                floor.bounding_box[2],
                floor.bounding_box[3]
            )
            detections['floor'] = [floor]
        
        return detections
    
    def detect_from_rear_view(self, rear_image: np.ndarray) -> Dict[str, List[ComponentLocation]]:
        """
        Detect components visible from rear view
        
        Args:
            rear_image: Rear view image
            
        Returns:
            Dictionary of detected components
        """
        detections = {}
        
        height, width = rear_image.shape[:2]
        
        # Detect rear wing
        rear_wing_roi = self._get_roi(rear_image, (0.2, 0.1), (0.8, 0.5))
        rear_wing = self._detect_rear_wing(rear_wing_roi)
        if rear_wing:
            rear_wing.bounding_box = (
                int(rear_wing.bounding_box[0] + width * 0.2),
                int(rear_wing.bounding_box[1] + height * 0.1),
                rear_wing.bounding_box[2],
                rear_wing.bounding_box[3]
            )
            detections['rear_wing'] = [rear_wing]
        
        # Detect diffuser
        diffuser_roi = self._get_roi(rear_image, (0.25, 0.6), (0.75, 0.95))
        diffuser = self._detect_diffuser(diffuser_roi)
        if diffuser:
            diffuser.bounding_box = (
                int(diffuser.bounding_box[0] + width * 0.25),
                int(diffuser.bounding_box[1] + height * 0.6),
                diffuser.bounding_box[2],
                diffuser.bounding_box[3]
            )
            detections['diffuser'] = [diffuser]
        
        # Detect beam wing
        beam_wing_roi = self._get_roi(rear_image, (0.3, 0.45), (0.7, 0.65))
        beam_wing = self._detect_beam_wing(beam_wing_roi)
        if beam_wing:
            beam_wing.bounding_box = (
                int(beam_wing.bounding_box[0] + width * 0.3),
                int(beam_wing.bounding_box[1] + height * 0.45),
                beam_wing.bounding_box[2],
                beam_wing.bounding_box[3]
            )
            detections['beam_wing'] = [beam_wing]
        
        return detections
    
    def _get_roi(self, image: np.ndarray, top_left: Tuple[float, float], 
                 bottom_right: Tuple[float, float]) -> np.ndarray:
        """Extract region of interest from image"""
        height, width = image.shape[:2]
        
        y1 = int(height * top_left[1])
        y2 = int(height * bottom_right[1])
        x1 = int(width * top_left[0])
        x2 = int(width * bottom_right[0])
        
        return image[y1:y2, x1:x2]
    
    def _detect_front_wing(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect front wing in ROI"""
        if roi.size == 0:
            return None
        
        gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY) if len(roi.shape) == 3 else roi
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Find largest horizontal contour
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        
        # Calculate center
        center = (x + w // 2, y + h // 2)
        
        # Confidence based on size and shape
        area = cv2.contourArea(largest)
        aspect_ratio = w / h if h > 0 else 0
        confidence = min((area / (roi.shape[0] * roi.shape[1])) * (aspect_ratio / 5), 1.0)
        
        return ComponentLocation(
            component_name='front_wing',
            bounding_box=(x, y, w, h),
            confidence=max(confidence, 0.7),
            center=center,
            area=area
        )
    
    def _detect_front_wing_side(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect front wing from side view"""
        return self._detect_front_wing(roi)
    
    def _detect_rear_wing(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect rear wing in ROI"""
        if roi.size == 0:
            return None
        
        gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY) if len(roi.shape) == 3 else roi
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        center = (x + w // 2, y + h // 2)
        area = cv2.contourArea(largest)
        
        confidence = min((area / (roi.shape[0] * roi.shape[1])) * 2, 1.0)
        
        return ComponentLocation(
            component_name='rear_wing',
            bounding_box=(x, y, w, h),
            confidence=max(confidence, 0.75),
            center=center,
            area=area
        )
    
    def _detect_rear_wing_top(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect rear wing from top view"""
        return self._detect_rear_wing(roi)
    
    def _detect_floor(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect floor in ROI"""
        if roi.size == 0:
            return None
        
        gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY) if len(roi.shape) == 3 else roi
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 30, 100)
        
        # Floor is typically a large horizontal region
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        center = (x + w // 2, y + h // 2)
        area = cv2.contourArea(largest)
        
        return ComponentLocation(
            component_name='floor',
            bounding_box=(x, y, w, h),
            confidence=0.80,
            center=center,
            area=area
        )
    
    def _detect_floor_edges(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect floor edges from top view"""
        return self._detect_floor(roi)
    
    def _detect_diffuser(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect diffuser in ROI"""
        if roi.size == 0:
            return None
        
        gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY) if len(roi.shape) == 3 else roi
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 40, 120)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        center = (x + w // 2, y + h // 2)
        area = cv2.contourArea(largest)
        
        return ComponentLocation(
            component_name='diffuser',
            bounding_box=(x, y, w, h),
            confidence=0.75,
            center=center,
            area=area
        )
    
    def _detect_sidepod(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect sidepod in ROI"""
        if roi.size == 0:
            return None
        
        gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY) if len(roi.shape) == 3 else roi
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 40, 120)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        center = (x + w // 2, y + h // 2)
        area = cv2.contourArea(largest)
        
        return ComponentLocation(
            component_name='sidepods',
            bounding_box=(x, y, w, h),
            confidence=0.78,
            center=center,
            area=area
        )
    
    def _detect_nose(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect nose in ROI"""
        if roi.size == 0:
            return None
        
        gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY) if len(roi.shape) == 3 else roi
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        center = (x + w // 2, y + h // 2)
        area = cv2.contourArea(largest)
        
        return ComponentLocation(
            component_name='nose',
            bounding_box=(x, y, w, h),
            confidence=0.82,
            center=center,
            area=area
        )
    
    def _detect_beam_wing(self, roi: np.ndarray) -> Optional[ComponentLocation]:
        """Detect beam wing in ROI"""
        if roi.size == 0:
            return None
        
        gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY) if len(roi.shape) == 3 else roi
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        edges = cv2.Canny(blurred, 40, 120)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        center = (x + w // 2, y + h // 2)
        area = cv2.contourArea(largest)
        
        return ComponentLocation(
            component_name='beam_wing',
            bounding_box=(x, y, w, h),
            confidence=0.72,
            center=center,
            area=area
        )
    
    def _detect_wheels(self, image: np.ndarray, position: str) -> List[ComponentLocation]:
        """Detect wheels in image"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Detect circles (wheels)
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1,
            minDist=image.shape[1] // 4,
            param1=50,
            param2=30,
            minRadius=20,
            maxRadius=100
        )
        
        wheels = []
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            for (x, y, r) in circles:
                wheels.append(ComponentLocation(
                    component_name=f'wheel_{position}',
                    bounding_box=(x - r, y - r, 2 * r, 2 * r),
                    confidence=0.85,
                    center=(x, y),
                    area=np.pi * r * r
                ))
        
        return wheels


if __name__ == "__main__":
    detector = ComponentDetector()
    
    # Example: Create dummy images
    dummy_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    images = {'front': dummy_image, 'side': dummy_image}
    
    detections = detector.detect_all_components(images)
    print(f"Detected {len(detections)} component types")
    
    for component, locations in detections.items():
        print(f"{component}: {len(locations)} detections")