import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService } from '../services/adminSessionService';

interface UserFormData {
  name: string;
  phone: string;
  jobTitle: string;
  department: string;
  notes: string;
  color: string;
  role: 'super_admin' | 'admin' | 'staff';
}

interface Permissions {
  [module: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
}

interface SmartUserBuilderProps {
  onClose: () => void;
  onSuccess: (userData: any) => void;
  existingUsers: any[];
}

const MODULES = [
  { id: 'finance', name: 'المالية', icon: '💰' },
  { id: 'farms', name: 'المزارع', icon: '🌴' },
  { id: 'documentation', name: 'التوثيق', icon: '📜' },
  { id: 'investors', name: 'المستثمرون', icon: '👥' },
  { id: 'reservations', name: 'الحجوزات', icon: '📋' },
  { id: 'whatsapp', name: 'إدارة الواتساب', icon: '💬' },
  { id: 'operations', name: 'التشغيل', icon: '⚙️' },
  { id: 'control', name: 'الرقابة', icon: '🛡️' },
  { id: 'support', name: 'الدعم', icon: '📬' },
];

const PERMISSION_TYPES = [
  { id: 'view', name: 'عرض', icon: '👁️' },
  { id: 'create', name: 'إنشاء', icon: '➕' },
  { id: 'edit', name: 'تعديل', icon: '✏️' },
  { id: 'delete', name: 'حذف', icon: '🗑️' },
  { id: 'approve', name: 'اعتماد', icon: '✅' },
];

const USER_COLORS = [
  '#D4AF37', '#3B82F6', '#10B981', '#EF4444', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
];

export function SmartUserBuilder({ onClose, onSuccess, existingUsers }: SmartUserBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    phone: '',
    jobTitle: '',
    department: '',
    notes: '',
    color: USER_COLORS[0],
    role: 'staff',
  });

  const [permissions, setPermissions] = useState<Permissions>(() => {
    const initialPermissions: Permissions = {};
    MODULES.forEach(module => {
      initialPermissions[module.id] = {
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      };
    });
    return initialPermissions;
  });

  const [isValid, setIsValid] = useState(false);

  const validateStep1 = () => {
    const nameValid = formData.name.trim().length >= 3;
    const phoneValid = /^05\d{8}$/.test(formData.phone);
    const phoneUnique = !existingUsers.some(u => u.phone === formData.phone);
    const jobTitleValid = formData.jobTitle.trim().length >= 2;

    setIsValid(nameValid && phoneValid && phoneUnique && jobTitleValid);

    return {
      nameValid,
      phoneValid,
      phoneUnique,
      jobTitleValid,
    };
  };

  const getAccessLevel = (): number => {
    let totalCells = 0;
    let activeCells = 0;

    Object.values(permissions).forEach(modulePerms => {
      Object.values(modulePerms).forEach(perm => {
        totalCells++;
        if (perm) activeCells++;
      });
    });

    return totalCells > 0 ? Math.round((activeCells / totalCells) * 100) : 0;
  };

  const applyDefaultPermissions = () => {
    const newPermissions = { ...permissions };

    MODULES.forEach(module => {
      if (formData.role === 'super_admin') {
        newPermissions[module.id] = {
          view: true,
          create: true,
          edit: true,
          delete: true,
          approve: true,
        };
      } else if (formData.role === 'admin') {
        newPermissions[module.id] = {
          view: true,
          create: true,
          edit: true,
          delete: false,
          approve: true,
        };
      } else {
        newPermissions[module.id] = {
          view: true,
          create: false,
          edit: false,
          delete: false,
          approve: false,
        };
      }
    });

    setPermissions(newPermissions);
  };

  const togglePermission = (moduleId: string, permType: keyof Permissions[string]) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [permType]: !prev[moduleId][permType],
      },
    }));
  };

  const generateSecretCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const validation = validateStep1();
      if (!validation.phoneValid) {
        alert('⚠️ رقم الجوال غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
        return;
      }
      if (!validation.phoneUnique) {
        alert('⚠️ هذا الرقم مستخدم بالفعل في حساب إداري آخر');
        return;
      }
      if (!validation.nameValid || !validation.jobTitleValid) {
        alert('⚠️ الرجاء إكمال البيانات المطلوبة');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (activateNow: boolean) => {
    try {
      const currentSession = AdminSessionService.getCurrentSession();
      const secretCode = generateSecretCode();

      console.log('🔥🔥🔥 [SmartUserBuilder] handleSubmit START');
      console.log('📞 Phone:', formData.phone);
      console.log('👤 Name:', formData.name);
      console.log('🔐 Secret Code:', secretCode);
      console.log('📋 Permissions:', permissions);

      // 1️⃣ حفظ في admin_users
      console.log('1️⃣ Saving to admin_users...');
      const createdUser = await AdminSessionService.createUserInDB({
        phone: formData.phone,
        full_name: formData.name,
        email: `${formData.phone}@temp.com`,
        is_active: activateNow,
        secret_code: secretCode,
        job_title: formData.jobTitle,
      });
      console.log('✅ User created in DB:', createdUser);

      // 2️⃣ حفظ الصلاحيات في admin_module_permissions
      console.log('2️⃣ Saving permissions to admin_module_permissions...');
      const moduleMapping: Record<string, { ar: string; en: string }> = {
        finance: { ar: 'المالية', en: 'Finance' },
        farms: { ar: 'المزارع', en: 'Farms' },
        documentation: { ar: 'التوثيق', en: 'Documentation' },
        investors: { ar: 'المستثمرون', en: 'Investors' },
        reservations: { ar: 'الحجوزات', en: 'Reservations' },
        whatsapp: { ar: 'إدارة الواتساب', en: 'WhatsApp Management' },
        operations: { ar: 'التشغيل', en: 'Operations' },
        control: { ar: 'الرقابة', en: 'Control' },
        support: { ar: 'الدعم', en: 'Support' },
      };

      for (const [moduleId, perms] of Object.entries(permissions)) {
        // فقط إذا كان لديه أي صلاحية في هذا القسم
        if (perms.view || perms.create || perms.edit || perms.delete || perms.approve) {
          console.log(`   Adding permission for module: ${moduleId}`);
          await AdminSessionService.addPermissionToDB({
            admin_phone: formData.phone,
            module_id: moduleId,
            module_name_ar: moduleMapping[moduleId]?.ar || moduleId,
            module_name_en: moduleMapping[moduleId]?.en || moduleId,
            can_view: perms.view,
            can_create: perms.create,
            can_edit: perms.edit,
            can_delete: perms.delete,
            icon: 'shield',
            is_active: true,
          });
          console.log(`   ✅ Permission added for ${moduleId}`);
        }
      }
      console.log('✅ All permissions saved to DB');

      // 3️⃣ حفظ في localStorage (للتوافق مع الكود القديم)
      const userData = {
        ...formData,
        permissions,
        secretCode,
        status: activateNow ? 'active' : 'pending',
        createdAt: new Date().toISOString(),
        createdBy: currentSession.admin?.name || 'المدير',
      };

      await AdminSessionService.addAccessLog(
        currentSession.admin?.phone || '',
        currentSession.admin?.name || '',
        'create_user_smart',
        `إضافة مستخدم ذكي: ${formData.name} (${formData.phone}) - الرقم السري: ${secretCode} - ${activateNow ? 'مفعّل' : 'تحت المراجعة'}`,
        'success'
      );

      console.log('✅ Calling onSuccess()...');
      onSuccess(userData);
      console.log('🔥🔥🔥 [SmartUserBuilder] handleSubmit END - SUCCESS');

      alert(`✅ ${activateNow ? `تم تفعيل المستخدم بنجاح\n\n🔑 الرقم السري: ${secretCode}\n\nيرجى حفظه للدخول` : 'تم حفظ المستخدم تحت المراجعة'}`);
      onClose();
    } catch (error) {
      console.error('❌❌❌ [SmartUserBuilder] Error creating user:', error);
      alert('❌ حدث خطأ في إنشاء المستخدم: ' + (error as any).message);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: brandGradients.gold }}
          >
            <User className="h-10 w-10 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-white">
          البيانات الأساسية للمستخدم
        </h3>
        <p className="mt-2 text-sm text-white/70">
          أدخل المعلومات الشخصية والوظيفية
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-white/90">
            👤 الاسم الكامل *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: محمد أحمد العلي"
            className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white placeholder-white/50 transition-all focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white/90">
            📱 رقم الجوال *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="05XXXXXXXX"
            maxLength={10}
            className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white placeholder-white/50 transition-all focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white/90">
            💼 المسمى الوظيفي *
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="مثال: مشرف مالي"
            className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white placeholder-white/50 transition-all focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white/90">
            🧭 القسم الإداري الرئيسي
          </label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white transition-all focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="" className="bg-gray-800">اختر القسم</option>
            {MODULES.map(mod => (
              <option key={mod.id} value={mod.id} className="bg-gray-800">
                {mod.icon} {mod.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-white/90">
            🎨 اللون التمييزي
          </label>
          <div className="flex gap-2">
            {USER_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className="h-10 w-10 rounded-full transition-all hover:scale-110"
                style={{
                  background: color,
                  border: formData.color === color ? '3px solid white' : 'none',
                  boxShadow: formData.color === color ? `0 0 20px ${color}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-white/90">
            🧾 ملاحظات داخلية
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="أي معلومات إضافية..."
            rows={3}
            className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white placeholder-white/50 transition-all focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: isValid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `2px solid ${isValid ? '#10B981' : '#EF4444'}`,
        }}
      >
        <div className="flex items-center gap-3">
          {isValid ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span className="font-bold text-green-400">🟢 صالح للدخول</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-6 w-6 text-red-400" />
              <span className="font-bold text-red-400">🔴 لم يُفعّل بعد</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: brandGradients.gold }}
          >
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-white">
          مصفوفة الصلاحيات التفاعلية
        </h3>
        <p className="mt-2 text-sm text-white/70">
          حدد الصلاحيات بدقة لكل قسم
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={applyDefaultPermissions}
          className="flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all hover:scale-105"
          style={{ background: 'rgba(59, 130, 246, 0.3)' }}
        >
          🔄 منح الصلاحيات الافتراضية
        </button>

        <div
          className="rounded-xl px-6 py-3"
          style={{
            background: `linear-gradient(135deg, rgba(212, 175, 55, ${getAccessLevel() / 100}) 0%, rgba(196, 148, 31, ${getAccessLevel() / 100}) 100%)`,
          }}
        >
          <span className="text-xl font-black text-white">
            نطاق الوصول: {getAccessLevel()}%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="sticky right-0 bg-gray-900 p-3 text-right font-black text-white">
                القسم
              </th>
              {PERMISSION_TYPES.map(perm => (
                <th key={perm.id} className="p-3 text-center font-black text-white">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{perm.icon}</span>
                    <span className="text-xs">{perm.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map(module => (
              <tr key={module.id} className="border-t border-white/10">
                <td className="sticky right-0 bg-gray-900 p-3 font-bold text-white">
                  <span className="mr-2">{module.icon}</span>
                  {module.name}
                </td>
                {PERMISSION_TYPES.map(perm => (
                  <td key={perm.id} className="p-3 text-center">
                    <button
                      onClick={() => togglePermission(module.id, perm.id as keyof Permissions[string])}
                      className="h-10 w-10 rounded-lg transition-all hover:scale-110"
                      style={{
                        background: permissions[module.id][perm.id as keyof Permissions[string]]
                          ? brandGradients.gold
                          : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: permissions[module.id][perm.id as keyof Permissions[string]]
                          ? '0 4px 20px rgba(212, 175, 55, 0.5)'
                          : 'none',
                      }}
                    >
                      {permissions[module.id][perm.id as keyof Permissions[string]] && (
                        <CheckCircle className="mx-auto h-5 w-5 text-white" />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const enabledModules = Object.entries(permissions).filter(([_, perms]) =>
      Object.values(perms).some(p => p)
    );

    return (
      <div className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full animate-pulse"
              style={{ background: brandGradients.gold }}
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">
            مراجعة وتفعيل المستخدم
          </h3>
          <p className="mt-2 text-sm text-white/70">
            راجع البيانات قبل التفعيل النهائي
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <h4 className="mb-4 text-xl font-black text-white">📋 ملخص المستخدم</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full"
                style={{ background: formData.color }}
              />
              <div>
                <p className="font-black text-white">{formData.name}</p>
                <p className="text-sm text-white/70">{formData.phone}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-white/70">المسمى الوظيفي</p>
                <p className="font-bold text-white">{formData.jobTitle}</p>
              </div>

              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-white/70">القسم الرئيسي</p>
                <p className="font-bold text-white">
                  {MODULES.find(m => m.id === formData.department)?.name || 'غير محدد'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white/5 p-3">
              <p className="mb-2 text-xs text-white/70">الأقسام المتاحة ({enabledModules.length})</p>
              <div className="flex flex-wrap gap-2">
                {enabledModules.map(([moduleId]) => {
                  const module = MODULES.find(m => m.id === moduleId);
                  return (
                    <span
                      key={moduleId}
                      className="rounded-full px-3 py-1 text-sm font-bold text-white"
                      style={{ background: 'rgba(212, 175, 55, 0.3)' }}
                    >
                      {module?.icon} {module?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg bg-white/5 p-3">
              <p className="mb-2 text-xs text-white/70">نطاق الوصول</p>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${getAccessLevel()}%`,
                      background: brandGradients.gold,
                    }}
                  />
                </div>
                <span className="font-black text-white">{getAccessLevel()}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <button
            onClick={() => handleSubmit(true)}
            className="flex items-center justify-center gap-2 rounded-xl py-4 font-black text-white transition-all hover:scale-105"
            style={{ background: brandGradients.gold }}
          >
            <CheckCircle className="h-5 w-5" />
            ✅ تفعيل فوراً
          </button>

          <button
            onClick={() => handleSubmit(false)}
            className="flex items-center justify-center gap-2 rounded-xl py-4 font-black text-white transition-all hover:scale-105"
            style={{ background: 'rgba(251, 191, 36, 0.3)' }}
          >
            🕓 تحت المراجعة
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl py-4 font-black text-white transition-all hover:scale-105"
            style={{ background: 'rgba(239, 68, 68, 0.3)' }}
          >
            🚫 إلغاء
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute left-6 top-6 rounded-full p-2 transition-all hover:bg-white/10"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full font-black transition-all ${
                  step === currentStep ? 'scale-125' : ''
                }`}
                style={{
                  background: step <= currentStep ? brandGradients.gold : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                {step}
              </div>
              {step < 3 && (
                <ChevronLeft
                  className={`h-6 w-6 ${step < currentStep ? 'text-yellow-500' : 'text-white/30'}`}
                />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {currentStep < 3 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(107, 114, 128, 0.3)' }}
            >
              <ChevronRight className="h-5 w-5" />
              السابق
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all hover:scale-105"
              style={{ background: brandGradients.gold }}
            >
              التالي
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
