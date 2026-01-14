// src/main/java/com/campusvoice/campusvoice_backend/controller/CourseController.java
package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.dto.CourseDto;
import com.campusvoice.campusvoice_backend.model.Course;
import com.campusvoice.campusvoice_backend.model.CourseClass;
import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.repository.CourseClassRepository;
import com.campusvoice.campusvoice_backend.repository.CourseRepository;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseClassRepository courseClassRepository;

    public CourseController(
            CourseRepository courseRepository,
            UserRepository userRepository,
            CourseClassRepository courseClassRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.courseClassRepository = courseClassRepository;
    }

    // ✅ Lire tous les cours (avec teacher et allowedClasses)
    @GetMapping
    public List<CourseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAllWithTeacher();
        return courses.stream().map(course -> {
            CourseDto dto = new CourseDto();
            dto.setId(course.getId());
            dto.setCode(course.getCode());
            dto.setTitle(course.getTitle());
            dto.setDepartment(course.getDepartment());
            
            if (course.getTeacher() != null) {
                dto.setTeacherId(course.getTeacher().getId());
                dto.setTeacherName(course.getTeacher().getFullName());
            }
            
            dto.setAllowedClasses(course.getAllowedClasses());
            return dto;
        }).collect(Collectors.toList());
    }

    // ✅ Créer un cours
    @PostMapping
    public CourseDto createCourse(@RequestBody CourseRequest request) {
        Course course = new Course();
        course.setCode(request.getCode());
        course.setTitle(request.getTitle());
        course.setDepartment(request.getDepartment());

        if (request.getTeacherId() != null) {
            User teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            course.setTeacher(teacher);
        }

        Course savedCourse = courseRepository.save(course);
        
        // ✅ Convertir en DTO pour inclure le teacher
        CourseDto dto = new CourseDto();
        dto.setId(savedCourse.getId());
        dto.setCode(savedCourse.getCode());
        dto.setTitle(savedCourse.getTitle());
        dto.setDepartment(savedCourse.getDepartment());
        
        if (savedCourse.getTeacher() != null) {
            dto.setTeacherId(savedCourse.getTeacher().getId());
            dto.setTeacherName(savedCourse.getTeacher().getFullName());
        }
        
        dto.setAllowedClasses(savedCourse.getAllowedClasses());
        return dto;
    }

    // ✅ Supprimer un cours
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Ajouter une classe autorisée à un cours
    @PostMapping("/{id}/classes")
    public ResponseEntity<Void> addClassToCourse(
            @PathVariable Long id,
            @RequestBody String className) {
        
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        CourseClass rule = new CourseClass();
        rule.setCourse(course);
        rule.setClassName(className.trim());
        
        courseClassRepository.save(rule);
        return ResponseEntity.ok().build();
    }

    // ✅ Supprimer une classe autorisée
    @DeleteMapping("/{id}/classes/{className}")
    public ResponseEntity<Void> removeClassFromCourse(
            @PathVariable Long id,
            @PathVariable String className) {
        
        courseClassRepository.deleteByCourseIdAndClassName(id, className);
        return ResponseEntity.noContent().build();
    }

    // ✅ Lire les classes autorisées pour un cours
    @GetMapping("/{id}/classes")
    public List<String> getClassesForCourse(@PathVariable Long id) {
        return courseClassRepository.findByCourseId(id).stream()
                .map(CourseClass::getClassName)
                .collect(Collectors.toList());
    }

    // ✅ DTO pour créer un cours
    public static class CourseRequest {
        private String code;
        private String title;
        private String department;
        private Long teacherId;

        public CourseRequest() {}

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public Long getTeacherId() { return teacherId; }
        public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    }
}