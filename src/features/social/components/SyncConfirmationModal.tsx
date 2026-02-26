
import React from 'react';
import { Check, User, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@ui/Modal';
import { Button } from '@ui/Button';
import { GlassSurface } from '@ui/GlassSurface';

interface SyncConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userPhoto?: string;
}

export const SyncConfirmationModal: React.FC<SyncConfirmationModalProps> = ({
    isOpen,
    onClose,
    userName,
    userPhoto
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            variant="floating"
            maxWidth="max-w-sm"
            showCloseButton={false}
        >
            <div className="flex flex-col items-center text-center py-4">
                {/* Ícone de Sucesso Animado */}
                <div className="relative mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 relative z-10"
                    >
                        <Check size={40} className="text-white" strokeWidth={3} />
                    </motion.div>

                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-emerald-400 blur-xl -z-0"
                    />
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Perfil Sincronizado!
                </h3>

                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 px-2 leading-relaxed">
                    Sua conta <span className="text-indigo-500 font-bold">Google</span> foi vinculada com sucesso ao seu perfil de jogador.
                </p>

                {/* Card de Visualização do Perfil */}
                <GlassSurface intensity="medium" className="w-full p-4 rounded-3xl border border-white/10 mb-8 flex items-center gap-4">
                    <div className="relative">
                        {userPhoto ? (
                            <img
                                src={userPhoto}
                                alt={userName}
                                className="w-16 h-16 rounded-2xl object-cover shadow-inner ring-2 ring-indigo-500/30"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                <User size={32} />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                            <LinkIcon size={12} className="text-white" />
                        </div>
                    </div>

                    <div className="text-left flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-0.5">Jogador Vinculado</p>
                        <h4 className="text-base font-bold text-slate-800 dark:text-white truncate">{userName}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                <span className="text-[9px] uppercase font-black text-indigo-500 tracking-wider">Level 1</span>
                            </div>
                        </div>
                    </div>
                </GlassSurface>

                <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={onClose}
                    className="shadow-indigo-500/30"
                >
                    Vamos Jogar!
                </Button>
            </div>
        </Modal>
    );
};
