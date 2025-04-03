# Appwrite Collections Documentation

## 1. Users Collection
// ... existing code ...

## 2. Courses Collection
```
Collection ID: courses

Attributes:
- title (string)
- instructor (string)
- teacherId (string, relation to teachers)
- duration (string)
- totalLessons (integer)
- students (integer)
- price (float)
- isPopular (boolean)
- isNew (boolean)
- image (string, optional)

Indexes:
- courses_title_search (Fulltext, attribute: title)
- courses_instructor (Key, attribute: instructor)
- courses_teacher_id (Key, attribute: teacherId)

Relationships:
- teacherId -> teachers.$id (Many-to-One)

Permissions:
- Read: Anyone can read
- Create: Authenticated users only
- Update: Only the creator or admin
- Delete: Only the creator or admin
```

// ... existing code ...

## 6. Teachers Collection
```
Collection ID: teachers

Attributes:
- name (string)
- title (string)
- avatar (string, optional)
- bio (string)

Indexes:
- teachers_name (Key, attribute: name)
- teachers_name_search (Fulltext, attribute: name)

Relationships:
- $id <- courses.teacherId (One-to-Many)

Permissions:
- Read: Anyone can read
- Create: Authenticated users only
- Update: Only the creator or admin
- Delete: Only the creator or admin
```

## Collection Relationships Summary
1. Users can have many Bookmarks (One-to-Many)
2. Users can have many Enrollments (One-to-Many)
3. Courses can have many Lessons (One-to-Many)
4. Courses can have many Bookmarks (One-to-Many)
5. Courses can have many Enrollments (One-to-Many)
6. Teachers can have many Courses (One-to-Many)
7. Each Course belongs to one Teacher (Many-to-One)

// ... rest of the file ... 