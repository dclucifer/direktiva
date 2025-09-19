
import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AccountPage: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Akun Saya</h1>
            <Card className="p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Akun</label>
                    <Input type="email" value="user@example.com" disabled />
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Ganti Email</h3>
                    <Input type="email" placeholder="Masukkan email baru" />
                    <Button className="mt-2 w-full">Kirim Link Konfirmasi</Button>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Reset Password</h3>
                    <p className="text-sm text-gray-500 mb-2">Kami akan mengirimkan link untuk mereset password ke email Anda.</p>
                    <Button variant="secondary" className="w-full">Kirim Link Reset Password</Button>
                </div>
            </Card>
        </div>
    );
};

export default AccountPage;