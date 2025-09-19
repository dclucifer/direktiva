
import React from 'react';
import Card from '../components/ui/Card';

const ManualPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Cara Menggunakan Direktiva Studio</h1>
            <Card className="p-8 space-y-6">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <h2 className="text-xl font-bold">1. Mulai di Panel Input</h2>
                    <p>
                        Isi semua detail produk Anda di panel sebelah kiri. Semakin lengkap informasi yang Anda berikan,
                        semakin baik hasil skrip yang akan dihasilkan oleh AI.
                    </p>
                    
                    <h2 className="text-xl font-bold">2. Tentukan Strategi Konten</h2>
                    <p>
                        Pilih <strong>Mode Konten</strong>, <strong>Strategi Visual</strong>, <strong>Gaya Penulisan</strong>, dan parameter lainnya untuk
                        menyesuaikan output AI dengan brand voice dan tujuan marketing Anda.
                    </p>
                    
                    <h2 className="text-xl font-bold">3. Generate & Review</h2>
                    <p>
                        Setelah semua form terisi, klik tombol <strong>Generate</strong>. Tunggu beberapa saat hingga AI selesai memproses.
                        Hasilnya akan muncul di panel sebelah kanan dalam bentuk kartu-kartu skrip.
                    </p>

                    <h2 className="text-xl font-bold">4. Edit dan Variasi</h2>
                    <p>
                        Setiap bagian dari skrip (Hook, Content, CTA) memiliki tombol <strong>Edit</strong> untuk penyesuaian manual dan <strong>A/B Varian</strong>
                        untuk meminta AI membuat versi alternatif. Gunakan fitur ini untuk menyempurnakan skrip Anda.
                    </p>
                    
                    <h2 className="text-xl font-bold">5. Ekspor Hasil Akhir</h2>
                    <p>
                        Gunakan tombol <strong>Export</strong> di setiap kartu skrip untuk mengunduh aset yang Anda butuhkan,
                        mulai dari file JSON, CSV, SRT untuk Capcut, hingga mengunduh gambar dan file voice over.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default ManualPage;