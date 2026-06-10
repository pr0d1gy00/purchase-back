import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(email: string, pass: string) {
        const user = await this.userService.findByEmail(email)
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const isMatch = await bcrypt.compare(pass, user.password)
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const payload = { sub: user.id, email: user.email };

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    }
    async register(email: string, pass: string, name?: string) {
        // 1. Verificamos que el email no exista
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new BadRequestException('Ese correo ya está registrado');
        }
        // 2. Hasheamos la contraseña
        const hashedPassword = await bcrypt.hash(pass, 10);
        // 3. Creamos el usuario
        await this.userService.create({
            email,
            password: hashedPassword,
            name,
        });
        // 4. Lo logueamos automáticamente (opcional, pero mejora la experiencia de usuario)
        // Fijate que le paso el pass SIN hashear porque el login hace el compare adentro
        return this.login(email, pass);
    }
}
