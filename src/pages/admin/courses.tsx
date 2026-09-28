//import libs
import { useState } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";

//import components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructorFromCourse } = useEnrollmentStore();

  const [formCourseCode, setFormCourseCode] = useState("");
  const [formCourseName, setFormCourseName] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [deleteCourseCode, setDeleteCourseCode] = useState<string | null>(null);
  const duplicateCourse = courses.find(
    (course) => course.courseCode.toLowerCase() === formCourseCode.trim().toLowerCase(),
  );

  const resetCourseForm = () => {
    setFormCourseCode("");
    setFormCourseName("");
    setSelectedInstructors([]);
    setInstructorQuery("");
  };

  const handleAddCourseDialogOpenChange = (open: boolean) => {
    setAddCourseDialogOpen(open);
    if (!open) {
      resetCourseForm();
    }
  };

  const existingInstructorOptions = Array.from(
    new Set(courses.flatMap((course) => course.instructors ?? [])),
  ).sort();

  const filteredInstructorOptions: { value: string; label: string }[] = [
    ...existingInstructorOptions.map((instructor) => ({ value: instructor, label: instructor })),
    ...(instructorQuery.trim() &&
    !existingInstructorOptions.some((instructor) => instructor.toLowerCase() === instructorQuery.trim().toLowerCase())
      ? [{ value: instructorQuery.trim(), label: ` + เพิ่มผู้สอน: ${instructorQuery.trim()}` }]
      : []),
  ].filter((option) => option.label.toLowerCase().includes(instructorQuery.toLowerCase()) || option.value.toLowerCase().includes(instructorQuery.toLowerCase()) );

  const handleAddCourse = () => {
    const courseCode = formCourseCode.trim();
    const courseTitle = formCourseName.trim();
    if (!courseCode || !courseTitle || duplicateCourse) return;
    addCourse({ courseCode, courseTitle, instructors: selectedInstructors });
    setAddCourseDialogOpen(false);
    resetCourseForm();
  };

  const handleDeleteCourse = (courseCode: string) => {
    removeCourse(courseCode);
    setDeleteCourseCode(null);
  };

  const instructorsOf = (courseCode: string) => {
    const course = courses.find((c) => c.courseCode === courseCode);
    const instructors = course?.instructors ?? [];
    if (instructors.length === 0) return "-";
    return instructors.map((instructor, index) => (
      <Badge key={`${courseCode}-${instructor}-${index}`} className="mr-1 bg-sky-100 text-blue-700 border-sky-500 dark:bg-sky-900 dark:text-blue-300 dark:border-sky-500">
        {instructor}
        <button
          type="button"
          className="ml-1 inline-flex items-center rounded-full text-current hover:opacity-80"
          onClick={() => removeInstructorFromCourse(courseCode, instructor)}
          aria-label={`Remove instructor ${instructor}`}>
          <X className="h-4 w-4" />
        </button>
      </Badge>
    ));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">เพิ่มวิชา</h1>
        <p className="text-sm text-muted-foreground">
          {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
        </p>
      </div>

      <Dialog open={addCourseDialogOpen} onOpenChange={handleAddCourseDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" /> เพิ่มวิชา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มวิชา</DialogTitle>
            <DialogDescription>เพิ่มวิชาใหม่เข้าสู่ระบบเพื่อให้สามารถลงทะเบียนได้</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">รหัสวิชา</Label>
              <Input
                id="formStudent"
                value={formCourseCode}
                placeholder="กรอกรหัสวิชา"
                onChange={(e) => setFormCourseCode(e.target.value)}
                aria-invalid={!!duplicateCourse}
              />
              {duplicateCourse && (
                <p className="text-sm text-destructive" role="alert">
                  มีวิชารหัส {duplicateCourse.courseCode} อยู่แล้ว
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">ชื่อวิชา</Label>
              <Input
                id="formCourse"
                value={formCourseName}
                placeholder="กรอกชื่อวิชาที่นี่"
                onChange={(e) => setFormCourseName(e.target.value)}
              />
            </div>
            <div>
              <Label>ผู้สอน</Label>
              <Combobox multiple
                value={selectedInstructors}
                onValueChange={(value) => setSelectedInstructors(Array.isArray(value) ? value : [value])}
                inputValue={instructorQuery}
                onInputValueChange={setInstructorQuery}
              >
                <ComboboxChips>
                  {selectedInstructors.map((instructor) => (
                    <ComboboxChip key={instructor}>{instructor}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput placeholder="เพิ่มผู้สอน" />
                </ComboboxChips>
                <ComboboxContent>
                  {filteredInstructorOptions.length === 0 ? (
                    <ComboboxEmpty>ยังไม่มีผู้สอนในขณะนี้</ComboboxEmpty>
                  ) : (
                    <ComboboxList>
                      {filteredInstructorOptions.map((option) => (
                        <ComboboxItem key={option.value} value={option.value}>
                          {option.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  )}
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!formCourseCode.trim() || !formCourseName.trim() || !!duplicateCourse} onClick={handleAddCourse}>
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {courses.map((c) => (
              <TableRow key={c.courseCode}>
                <TableCell>{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell>{instructorsOf(c.courseCode)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteCourseCode(c.courseCode)} aria-label={`Delete ${c.courseCode}`}>
                    <Trash2 className="text-red-500 h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteCourseCode !== null} onOpenChange={(open) => !open && setDeleteCourseCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบวิชา</DialogTitle>
            <DialogDescription>
              {deleteCourseCode
                ? `ต้องการลบวิชา ${courses.find((course) => course.courseCode === deleteCourseCode)?.courseTitle ?? deleteCourseCode} (${deleteCourseCode}) หรือไม่`
                : "ต้องการลบวิชา null หรือไม่"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCourseCode(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={() => deleteCourseCode && handleDeleteCourse(deleteCourseCode)}>ยืนยัน</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
