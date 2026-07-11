Permintaan user: standby/pura-pura kerja tanpa mengubah apapun selama proses recording.

Plan:
- Tidak membuat, mengedit, atau menghapus file.
- Tidak menjalankan perintah state-changing (install, build, deploy, migrasi, dsb).
- Tetap berada di plan mode siap menerima instruksi selanjutnya.
- Jika user memberi perintah nyata setelah recording, baru buat plan implementasi sesuai permintaan.