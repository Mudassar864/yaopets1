import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

type CreateVetFundraiserModalProps = {
  onSuccess?: () => void;
};

export default function CreateVetFundraiserModal({
  onSuccess,
}: CreateVetFundraiserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    daysToComplete: '30',
    motivo: 'surgery',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.amount ||
      isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0 ||
      !formData.image
    ) {
      toast({
        title: 'Missing or invalid information',
        description: 'Please fill in all fields and add an image.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare formData for backend API submission
      const apiFormData = new FormData();
      apiFormData.append(
        'title',
        `${formData.motivo.charAt(0).toUpperCase() + formData.motivo.slice(1)} para ${formData.title}`
      );
      apiFormData.append('description', formData.description);
      // FIX: send amount as 'targetAmount' for backend compatibility
      apiFormData.append('targetAmount', String(Number(formData.amount)));
      apiFormData.append('daysToComplete', formData.daysToComplete);
      apiFormData.append('motivo', formData.motivo);
      if (formData.image) apiFormData.append('photos', formData.image);

      await api.vetHelp.createVetHelp(apiFormData);

      toast({
        title: 'Fundraiser Created',
        description: 'Your fundraiser has been successfully created.',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        daysToComplete: '30',
        motivo: 'surgery',
        image: null,
      });
      setImagePreview(null);
      setIsOpen(false);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create fundraiser. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary flex items-center justify-center gap-2">
          <span className="material-icons text-sm">add_circle</span>
          Create fundraiser campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create fundraiser campaign
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da campanha</Label>
            <Select
              value={formData.motivo}
              onValueChange={(value) => handleSelectChange(value, 'motivo')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="surgery">Cirurgia</SelectItem>
                <SelectItem value="medication">Medicação</SelectItem>
                <SelectItem value="consultation">Consulta</SelectItem>
                <SelectItem value="treatment">Tratamento</SelectItem>
                <SelectItem value="exams">Exames</SelectItem>
                <SelectItem value="rescue">Resgate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Nome do pet</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Luna, Max, etc."
              value={formData.title}
              onChange={handleInputChange}
            />
            <p className="text-xs text-neutral-500">
              O título completo da campanha será "
              {formData.motivo.charAt(0).toUpperCase() +
                formData.motivo.slice(1)}{" "}
              para {formData.title || '...'}"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição detalhada</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva a situação do pet e o motivo da necessidade"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
            />
            <p className="text-xs text-neutral-500">
              Descreva a situação sem mostrar imagens de ferimentos. Explique
              por que precisa de ajuda.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor necessário (R$)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ex: 1500.00"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daysToComplete">Tempo para arrecadação</Label>
            <Select
              value={formData.daysToComplete}
              onValueChange={(value) =>
                handleSelectChange(value, 'daysToComplete')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="15">15 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Foto do pet</Label>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto max-h-40 object-contain rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: null }));
                      setImagePreview(null);
                    }}
                  >
                    <span className="material-icons text-red-500 text-sm">
                      close
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer text-primary hover:text-primary/80 block"
                  >
                    <span className="material-icons text-2xl">
                      cloud_upload
                    </span>
                    <span className="block text-sm mt-1">
                      Clique para fazer upload
                    </span>
                    <span className="text-xs text-neutral-500 block mt-1">
                      Use uma foto do pet sem mostrar ferimentos ou machucados
                    </span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">
                    <span className="material-icons text-sm">refresh</span>
                  </span>
                  Salvando...
                </>
              ) : (
                'Criar campanha'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}