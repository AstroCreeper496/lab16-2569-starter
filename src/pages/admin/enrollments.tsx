//import libs
import { useState } from "react";
import { PlusCircle } from "lucide-react";

//import components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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

//type
type Option = { value: string; label: string };

//vars
import { useEnrollmentStore } from "@/lib/enrollment-store";


function OptionSelect({id, options, value, onChange, placeholder,
}: { id: string; options: Option[]; value: string | null; onChange: (value: string) => void; placeholder?: string;}) {

  return (
    <Select items={options} value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollments, drop } = useEnrollmentStore();

  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน
  const availableStudentOptions = studentOptions.filter(
    (s) => !enrollments.some((e) => e.studentId === s.value && e.courseId === formCourse),
  );
  const filteredStudentOptions = availableStudentOptions.filter((student) =>
    student.label.toLowerCase().includes(studentQuery.toLowerCase()),
  );

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;

    formStudents.forEach((studentId) => {
      useEnrollmentStore.getState().enroll(studentId, formCourse);
    });

    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
      setStudentQuery("");
    }
  };

  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };

  const titleOf = (courseId: string) =>
    courses.find((c) => c.courseCode === courseId)?.courseTitle ?? "-";

  const tableHeaders =
    mode === "course"
      ? ["รหัสวิชา", "ชื่อวิชา", "จำนวนนักศึกษา", "นักศึกษาที่ลงทะเบียน"]
      : ["รหัสนักศึกษา", "ชื่อนักศึกษา", "จำนวนวิชา", "รายวิชาที่ลงทะเบียน"];

  const renderStudentBadges = (courseCode: string) => {
    const registeredStudents = enrollments.filter((e) => e.courseId === courseCode);

    if (registeredStudents.length === 0) return "-";

    return registeredStudents.map((entry) => (
      <Badge key={`${courseCode}-${entry.studentId}`} className="mr-1 inline-flex items-center gap-1 bg-sky-100 text-blue-700 border-sky-500 dark:bg-sky-900 dark:text-blue-300 dark:border-sky-500">
        {nameOf(entry.studentId)}
        <button
          type="button"
          className="inline-flex items-center rounded-full hover:opacity-80"
          onClick={() => drop(entry.studentId, courseCode)}
          aria-label={`Remove ${nameOf(entry.studentId)} from ${courseCode}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    ));
  };

  const renderCourseBadges = (studentId: string) => {
    const registeredCourses = enrollments.filter((e) => e.studentId === studentId);

    if (registeredCourses.length === 0) return "-";

    return registeredCourses.map((entry) => (
      <Badge key={`${studentId}-${entry.courseId}`} className="mr-1 inline-flex items-center gap-1">
        {titleOf(entry.courseId)}
        <button
          type="button"
          className="inline-flex items-center rounded-full hover:opacity-80"
          onClick={() => drop(studentId, entry.courseId)}
          aria-label={`Remove ${titleOf(entry.courseId)} from ${studentId}`}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    ));
  };

  const displayRows =
    mode === "course"
      ? courses
          .filter((course) => filterCourse === "all" || course.courseCode === filterCourse)
          .map((course) => {
            const registeredStudents = enrollments.filter((e) => e.courseId === course.courseCode);
            return {
              key: course.courseCode,
              col1: course.courseCode,
              col2: course.courseTitle,
              col3: String(registeredStudents.length),
              col4: renderStudentBadges(course.courseCode),
            };
          })
      : students
          .filter((student) => filterStudent === "all" || student.studentId === filterStudent)
          .map((student) => {
            const registeredCourses = enrollments.filter((e) => e.studentId === student.studentId);
            return {
              key: student.studentId,
              col1: student.studentId,
              col2: `${student.firstName} ${student.lastName}`,
              col3: String(registeredCourses.length),
              col4: renderCourseBadges(student.studentId),
            };
          });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน</p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />ลงทะเบียนให้นักศึกษา</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น (เลือกได้มากกว่า 1 คน)</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                onChange={(value) => {
                  setFormCourse(value);
                  setFormStudents([]);
                  setStudentQuery("");
                }}
                placeholder="เลือกวิชา"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              <Combobox
                multiple
                value={formStudents}
                onValueChange={(value) => setFormStudents(Array.isArray(value) ? value : [value])}
                inputValue={studentQuery}
                onInputValueChange={setStudentQuery}
                disabled={!formCourse}
              >
                <ComboboxChips>
                  {formStudents.map((studentId) => {
                    const student = studentOptions.find((option) => option.value === studentId);
                    return <ComboboxChip key={studentId}>{student?.label ?? studentId}</ComboboxChip>;
                  })}
                  <ComboboxChipsInput id="formStudent" placeholder="ค้นหานักศึกษา" />
                </ComboboxChips>
                <ComboboxContent>
                  {filteredStudentOptions.length === 0 ? (
                    <ComboboxEmpty>
                      {availableStudentOptions.length === 0
                        ? formCourse ? "ลงทะเบียนครบทุกคนแล้ว" : "เลือกวิชาก่อน"
                        : "ไม่พบนักศึกษา"}
                    </ComboboxEmpty>
                  ) : (
                    <ComboboxList>
                      {filteredStudentOptions.map((student) => (
                        <ComboboxItem key={student.value} value={student.value}>
                          {student.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  )}
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!formCourse || formStudents.length === 0} onClick={handleEnroll}>
              <PlusCircle className="h-4 w-4" /> ลงทะเบียน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "course" | "student")}>
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect id="filterCourse" value={filterCourse} onChange={setFilterCourse} options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}/>
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">ไม่พบข้อมูลการลงทะเบียน</TableCell>
              </TableRow>
            )}
            {displayRows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>{row.col1}</TableCell>
                <TableCell>{row.col2}</TableCell>
                <TableCell>{row.col3}</TableCell>
                <TableCell>{row.col4}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
