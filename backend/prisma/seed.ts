import { PrismaClient, Role, ClubMemberRole, EventStatus, RegistrationStatus, AttendanceMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing records (in reverse relation order)
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      password: passwordHash,
      name: 'Dr. Sarah Connor',
      role: Role.ADMIN,
      department: 'Dean of Student Affairs',
    },
  });

  const organizerRobotics = await prisma.user.create({
    data: {
      email: 'lead.robotics@college.edu',
      password: passwordHash,
      name: 'Ethan Hunt',
      role: Role.ORGANIZER,
      department: 'Computer Science & Engineering',
      rollNumber: 'CS2022045',
    },
  });

  const organizerAcm = await prisma.user.create({
    data: {
      email: 'lead.acm@college.edu',
      password: passwordHash,
      name: 'Maya Lin',
      role: Role.ORGANIZER,
      department: 'Information Technology',
      rollNumber: 'IT2022019',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@college.edu',
      password: passwordHash,
      name: 'Alex Johnson',
      role: Role.STUDENT,
      department: 'Computer Science',
      rollNumber: 'CS2024001',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@college.edu',
      password: passwordHash,
      name: 'Samantha Ray',
      role: Role.STUDENT,
      department: 'Electrical Engineering',
      rollNumber: 'EE2024012',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@college.edu',
      password: passwordHash,
      name: 'David Kim',
      role: Role.STUDENT,
      department: 'Mechanical Engineering',
      rollNumber: 'ME2024033',
    },
  });

  console.log('Seeded users: Admin, 2 Organizers, 3 Students');

  // 3. Create Clubs
  const roboticsClub = await prisma.club.create({
    data: {
      name: 'Robotics & AI Society',
      slug: 'robotics-ai-society',
      description: 'Designing autonomous systems, computer vision algorithms, and robotic hardware.',
      category: 'Technology',
      leadId: organizerRobotics.id,
      members: {
        create: [
          { userId: organizerRobotics.id, role: ClubMemberRole.LEAD },
          { userId: student1.id, role: ClubMemberRole.MEMBER },
        ],
      },
    },
  });

  const acmClub = await prisma.club.create({
    data: {
      name: 'ACM Student Chapter',
      slug: 'acm-student-chapter',
      description: 'Fostering algorithmic thinking, open-source projects, and competitive programming.',
      category: 'Coding & Algorithms',
      leadId: organizerAcm.id,
      members: {
        create: [
          { userId: organizerAcm.id, role: ClubMemberRole.LEAD },
          { userId: student2.id, role: ClubMemberRole.MEMBER },
        ],
      },
    },
  });

  console.log('Seeded clubs: Robotics Society, ACM Chapter');

  // 4. Create Events
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekEnd = new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000);

  const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastWeekEnd = new Date(pastWeek.getTime() + 3 * 60 * 60 * 1000);

  // Upcoming Event 1
  const hackathon = await prisma.event.create({
    data: {
      clubId: acmClub.id,
      createdById: organizerAcm.id,
      title: 'HackPulse 2026: 24h Campus Hackathon',
      slug: 'hackpulse-2026',
      description: 'A 24-hour hackathon challenging students to build innovative AI and web solutions.',
      category: 'Hackathon',
      venue: 'Main Auditorium & Innovation Lab',
      startDateTime: nextWeek,
      endDateTime: nextWeekEnd,
      capacity: 50,
      registrationDeadline: new Date(nextWeek.getTime() - 24 * 60 * 60 * 1000),
      status: EventStatus.APPROVED,
    },
  });

  // Upcoming Event 2 (Pending approval)
  await prisma.event.create({
    data: {
      clubId: roboticsClub.id,
      createdById: organizerRobotics.id,
      title: 'Hands-on ROS2 & Drone Navigation Workshop',
      slug: 'ros2-drone-navigation',
      description: 'Learn robot operating system fundamentals and control quadcopters in simulation.',
      category: 'Workshop',
      venue: 'Robotics Lab 304',
      startDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 30,
      registrationDeadline: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      status: EventStatus.PENDING_APPROVAL,
    },
  });

  // Past Event with Completed status & attendance
  const pastWorkshop = await prisma.event.create({
    data: {
      clubId: acmClub.id,
      createdById: organizerAcm.id,
      title: 'Competitive Programming Kickoff',
      slug: 'competitive-programming-kickoff',
      description: 'Master dynamic programming, graph theory, and algorithmic problem solving.',
      category: 'Seminar',
      venue: 'Seminar Hall B',
      startDateTime: pastWeek,
      endDateTime: pastWeekEnd,
      capacity: 40,
      registrationDeadline: new Date(pastWeek.getTime() - 24 * 60 * 60 * 1000),
      status: EventStatus.COMPLETED,
    },
  });

  // 5. Create Registrations for Hackathon
  const reg1 = await prisma.registration.create({
    data: {
      eventId: hackathon.id,
      userId: student1.id,
      status: RegistrationStatus.CONFIRMED,
      qrToken: `QR-HACKPULSE-${student1.id}`,
    },
  });

  await prisma.registration.create({
    data: {
      eventId: hackathon.id,
      userId: student2.id,
      status: RegistrationStatus.CONFIRMED,
      qrToken: `QR-HACKPULSE-${student2.id}`,
    },
  });

  // 6. Past event registration + attendance + certificate
  const pastReg = await prisma.registration.create({
    data: {
      eventId: pastWorkshop.id,
      userId: student1.id,
      status: RegistrationStatus.CONFIRMED,
      qrToken: `QR-PAST-${student1.id}`,
    },
  });

  await prisma.attendance.create({
    data: {
      registrationId: pastReg.id,
      eventId: pastWorkshop.id,
      userId: student1.id,
      markedById: organizerAcm.id,
      method: AttendanceMethod.QR_SCAN,
    },
  });

  await prisma.certificate.create({
    data: {
      certificateCode: `CERT-CP-${pastWorkshop.id.slice(0, 4)}-${student1.id.slice(0, 4)}`.toUpperCase(),
      eventId: pastWorkshop.id,
      userId: student1.id,
      issuedById: organizerAcm.id,
    },
  });

  // 7. Seed notification
  await prisma.notification.create({
    data: {
      userId: student1.id,
      title: 'Registration Confirmed',
      message: 'You are successfully registered for HackPulse 2026: 24h Campus Hackathon.',
      type: 'REGISTRATION',
      isRead: false,
    },
  });

  console.log('Database seeded successfully with users, clubs, events, registrations & certificates!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
